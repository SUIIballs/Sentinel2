import type { MotionSensorData } from "../types/sensor";

interface MotionSample {
  time: number;
  magnitude: number;
  rotation: number;
}

class FallDetectionService {
  // ==========================================
  // DETECTION PARAMETERS
  // ==========================================

  private readonly IMPACT_THRESHOLD = 20.0;
  private readonly FREE_FALL_THRESHOLD = 8.0;
  private readonly PRE_IMPACT_WINDOW = 1000;
  private readonly POST_IMPACT_WINDOW = 1200;
  private readonly COOLDOWN_TIME = 3000;
  private readonly FALL_SCORE_THRESHOLD = 0.68;

  // ==========================================
  // SCORE WEIGHTS
  // ==========================================

  private readonly IMPACT_WEIGHT = 0.30;
  private readonly PRE_IMPACT_WEIGHT = 0.25;
  private readonly JERK_WEIGHT = 0.20;
  private readonly POST_IMPACT_WEIGHT = 0.15;
  private readonly ROTATION_WEIGHT = 0.10;

  // ==========================================
  // JERK PARAMETERS
  // ==========================================

  private readonly HIGH_JERK_START = 300;
  private readonly HIGH_JERK_FULL = 1000;

  // ==========================================
  // POST-IMPACT ROTATION
  // ==========================================

  private readonly STABLE_ROTATION = 25;
  private readonly UNSTABLE_ROTATION = 80;

  // ==========================================
  // SENSOR BUFFER
  // ==========================================

  private motionBuffer: MotionSample[] = [];

  // ==========================================
  // ACTIVE EVENT STATE
  // ==========================================

  private candidateImpact = false;
  private candidateImpactTime = 0;
  private candidateImpactMagnitude = 0;
  private eventMaxJerk = 0;

  // ==========================================
  // PERSISTENT EVENT DIAGNOSTICS
  // ==========================================

  private lastImpactDetected = false;
  private lastImpactMagnitude = 0;
  private lastEventMaxJerk = 0;
  private lastPostImpactRotation = 0;

  private cooldownUntil = 0;

  // ==========================================
  // DIAGNOSTIC STATE
  // ==========================================

  private currentStage:
    | "NORMAL"
    | "MONITORING"
    | "IMPACT"
    | "ANALYZING"
    | "FALL_CONFIRMED"
    | "FALSE_ALARM" = "NORMAL";

  private lastAcceleration = 0;
  private lastRotation = 0;
  private lastJerk = 0;
  private lastFallScore = 0;

  // ==========================================
  // MAIN FALL DETECTION
  // ==========================================

  detectFall(data: MotionSensorData): boolean {
    const now = Date.now();

    const magnitude =
      data.acceleration.magnitude;

    const alpha =
      data.gyroscope.alpha;

    const beta =
      data.gyroscope.beta;

    const gamma =
      data.gyroscope.gamma;

    const rotationMagnitude =
      Math.sqrt(
        alpha * alpha +
          beta * beta +
          gamma * gamma
      );

    // ------------------------------------------
    // CURRENT SENSOR VALUES
    // ------------------------------------------

    this.lastAcceleration = magnitude;
    this.lastRotation = rotationMagnitude;

    // ------------------------------------------
    // ADD SAMPLE
    // ------------------------------------------

    this.addSample(
      now,
      magnitude,
      rotationMagnitude
    );

    // ------------------------------------------
    // CURRENT JERK
    // ------------------------------------------

    const jerk =
      this.calculateCurrentJerk();

    this.lastJerk = jerk;

    // ==========================================
    // ACTIVE CANDIDATE EVENT
    // ==========================================

    if (this.candidateImpact) {
      this.currentStage = "ANALYZING";

      if (
        jerk > this.eventMaxJerk
      ) {
        this.eventMaxJerk = jerk;
      }

      const elapsed =
        now -
        this.candidateImpactTime;

      // ----------------------------------------
      // FINISH EVENT ANALYSIS
      // ----------------------------------------

      if (
        elapsed >=
        this.POST_IMPACT_WINDOW
      ) {
        const fallScore =
          this.calculateFallScore();

        this.lastFallScore =
          fallScore;

        // Persist completed event values
        this.lastEventMaxJerk =
          this.eventMaxJerk;

        console.log(
          "Fall Detection Analysis:",
          {
            score:
              fallScore.toFixed(3),

            threshold:
              this.FALL_SCORE_THRESHOLD,

            impact:
              this.candidateImpactMagnitude.toFixed(
                2
              ),

            maxJerk:
              this.eventMaxJerk.toFixed(
                2
              ),

            postRotation:
              this.lastPostImpactRotation.toFixed(
                2
              ),
          }
        );

        // ======================================
        // FALL CONFIRMED
        // ======================================

        if (
          fallScore >=
          this.FALL_SCORE_THRESHOLD
        ) {
          console.log(
            "🔴 FALL CONFIRMED",
            "Score:",
            fallScore.toFixed(3)
          );

          // IMPORTANT:
          // Keep FALL_CONFIRMED visible.
          this.currentStage =
            "FALL_CONFIRMED";

          this.cooldownUntil =
            now +
            this.COOLDOWN_TIME;

          this.resetActiveEvent();

          return true;
        }

        // ======================================
        // FALSE ALARM
        // ======================================

        console.log(
          "🟢 FALSE ALARM",
          "Score:",
          fallScore.toFixed(3)
        );

        this.currentStage =
          "FALSE_ALARM";

        this.resetActiveEvent();

        return false;
      }

      return false;
    }

    // ==========================================
    // COOLDOWN
    // ==========================================

    if (
      now < this.cooldownUntil
    ) {
      return false;
    }

    // ==========================================
    // PRE-IMPACT EVIDENCE
    // ==========================================

    const hasPreImpactDrop =
      this.hasRecentLowAcceleration();

    // ==========================================
    // POSSIBLE IMPACT
    // ==========================================

    const possibleImpact =
      magnitude >=
        this.IMPACT_THRESHOLD &&
      (
        hasPreImpactDrop ||
        jerk >=
          this.HIGH_JERK_START
      );

    // ==========================================
    // START CANDIDATE EVENT
    // ==========================================

    if (possibleImpact) {
      this.candidateImpact =
        true;

      this.candidateImpactTime =
        now;

      this.candidateImpactMagnitude =
        magnitude;

      this.lastImpactDetected =
        true;

      this.lastImpactMagnitude =
        magnitude;

      this.eventMaxJerk =
        jerk;

      this.currentStage =
        "IMPACT";

      console.log(
        "🟠 CANDIDATE IMPACT DETECTED",
        {
          acceleration:
            magnitude.toFixed(2),

          jerk:
            jerk.toFixed(2),

          rotation:
            rotationMagnitude.toFixed(
              2
            ),

          preImpactDrop:
            hasPreImpactDrop,
        }
      );

      return false;
    }

    // ==========================================
    // NORMAL / MONITORING
    // ==========================================

    // Do NOT overwrite FALL_CONFIRMED
    // immediately after an event.

    if (
      this.currentStage !==
      "FALL_CONFIRMED"
    ) {
      if (
        magnitude <
        this.FREE_FALL_THRESHOLD
      ) {
        this.currentStage =
          "MONITORING";
      } else {
        this.currentStage =
          "NORMAL";
      }
    }

    return false;
  }

  // ==========================================
  // BUFFER MANAGEMENT
  // ==========================================

  private addSample(
    time: number,
    magnitude: number,
    rotation: number
  ): void {
    this.motionBuffer.push({
      time,
      magnitude,
      rotation,
    });

    const cutoff =
      time -
      this.PRE_IMPACT_WINDOW -
      this.POST_IMPACT_WINDOW -
      500;

    this.motionBuffer =
      this.motionBuffer.filter(
        (sample) =>
          sample.time >= cutoff
      );
  }

  // ==========================================
  // JERK CALCULATION
  // ==========================================

  private calculateCurrentJerk(): number {
    if (
      this.motionBuffer.length <
      2
    ) {
      return 0;
    }

    const current =
      this.motionBuffer[
        this.motionBuffer.length - 1
      ];

    const previous =
      this.motionBuffer[
        this.motionBuffer.length - 2
      ];

    const deltaTime =
      (current.time -
        previous.time) /
      1000;

    if (
      deltaTime <= 0
    ) {
      return 0;
    }

    return (
      Math.abs(
        current.magnitude -
          previous.magnitude
      ) / deltaTime
    );
  }

  // ==========================================
  // PRE-IMPACT LOW ACCELERATION
  // ==========================================

  private hasRecentLowAcceleration(): boolean {
    if (
      this.motionBuffer.length ===
      0
    ) {
      return false;
    }

    const now =
      this.motionBuffer[
        this.motionBuffer.length - 1
      ].time;

    const recent =
      this.motionBuffer.filter(
        (sample) =>
          sample.time >=
          now -
            this.PRE_IMPACT_WINDOW
      );

    return recent.some(
      (sample) =>
        sample.magnitude <
        this.FREE_FALL_THRESHOLD
    );
  }

  // ==========================================
  // FALL SCORE CALCULATION
  // ==========================================

  private calculateFallScore(): number {
    const impactTime =
      this.candidateImpactTime;

    // ------------------------------------------
    // PRE-IMPACT SAMPLES
    // ------------------------------------------

    const preImpactSamples =
      this.motionBuffer.filter(
        (sample) =>
          sample.time >=
            impactTime -
              this.PRE_IMPACT_WINDOW &&
          sample.time < impactTime
      );

    // ------------------------------------------
    // POST-IMPACT SAMPLES
    // ------------------------------------------

    const postImpactSamples =
      this.motionBuffer.filter(
        (sample) =>
          sample.time > impactTime &&
          sample.time <=
            impactTime +
              this.POST_IMPACT_WINDOW
      );

    if (
      preImpactSamples.length === 0 ||
      postImpactSamples.length === 0
    ) {
      return 0;
    }

    // ==========================================
    // IMPACT SCORE
    // ==========================================

    const impactScore =
      this.normalize(
        this.candidateImpactMagnitude,
        18,
        32
      );

    // ==========================================
    // PRE-IMPACT DROP SCORE
    // ==========================================

    const preImpactMinimum =
      Math.min(
        ...preImpactSamples.map(
          (sample) =>
            sample.magnitude
        )
      );

    const preImpactDrop =
      Math.max(
        0,
        9 -
          preImpactMinimum
      );

    const preImpactScore =
      this.normalize(
        preImpactDrop,
        0,
        5
      );

    // ==========================================
    // JERK SCORE
    // ==========================================

    const jerkScore =
      this.normalize(
        this.eventMaxJerk,
        this.HIGH_JERK_START,
        this.HIGH_JERK_FULL
      );

    // ==========================================
    // POST-IMPACT ACCELERATION STABILITY
    // ==========================================

    const postMagnitudes =
      postImpactSamples.map(
        (sample) =>
          sample.magnitude
      );

    const postStd =
      this.standardDeviation(
        postMagnitudes
      );

    const postImpactStability =
      1 -
      this.normalize(
        postStd,
        0,
        8
      );

    // ==========================================
    // FINAL STABILITY
    // ==========================================

    const finalWindowStart =
      impactTime +
      this.POST_IMPACT_WINDOW -
      400;

    const finalSamples =
      postImpactSamples.filter(
        (sample) =>
          sample.time >=
          finalWindowStart
      );

    let finalStability =
      postImpactStability;

    if (
      finalSamples.length > 2
    ) {
      const finalStd =
        this.standardDeviation(
          finalSamples.map(
            (sample) =>
              sample.magnitude
          )
        );

      finalStability =
        1 -
        this.normalize(
          finalStd,
          0,
          5
        );
    }

    const postImpactScore =
      this.clamp(
        finalStability *
          0.7 +
          postImpactStability *
            0.3,
        0,
        1
      );

    // ==========================================
    // POST-IMPACT ROTATION
    // ==========================================

    const finalRotationSamples =
      finalSamples.length > 0
        ? finalSamples
        : postImpactSamples;

    const averageRotation =
      this.mean(
        finalRotationSamples.map(
          (sample) =>
            sample.rotation
        )
      );

    this.lastPostImpactRotation =
      averageRotation;

    const rotationStability =
      1 -
      this.normalize(
        averageRotation,
        this.STABLE_ROTATION,
        this.UNSTABLE_ROTATION
      );

    // ==========================================
    // COMBINED FALL SCORE
    // ==========================================

    let score =
      impactScore *
        this.IMPACT_WEIGHT +

      preImpactScore *
        this.PRE_IMPACT_WEIGHT +

      jerkScore *
        this.JERK_WEIGHT +

      postImpactScore *
        this.POST_IMPACT_WEIGHT +

      rotationStability *
        this.ROTATION_WEIGHT;

    // ==========================================
    // TEMPORAL EVIDENCE
    // ==========================================

    const temporalEvidence =
      preImpactScore >=
        0.25 ||
      jerkScore >=
        0.50;

    if (
      !temporalEvidence
    ) {
      score *= 0.55;
    }

    // ==========================================
    // ROTATION PENALTY
    // ==========================================

    if (
      averageRotation >
      this.UNSTABLE_ROTATION
    ) {
      score *= 0.65;
    }

    return this.clamp(
      score,
      0,
      1
    );
  }

  // ==========================================
  // NORMALIZE
  // ==========================================

  private normalize(
    value: number,
    min: number,
    max: number
  ): number {
    if (
      max <= min
    ) {
      return 0;
    }

    return this.clamp(
      (value - min) /
        (max - min),
      0,
      1
    );
  }

  // ==========================================
  // CLAMP
  // ==========================================

  private clamp(
    value: number,
    min: number,
    max: number
  ): number {
    return Math.min(
      Math.max(
        value,
        min
      ),
      max
    );
  }

  // ==========================================
  // MEAN
  // ==========================================

  private mean(
    values: number[]
  ): number {
    if (
      values.length === 0
    ) {
      return 0;
    }

    return (
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / values.length
    );
  }

  // ==========================================
  // STANDARD DEVIATION
  // ==========================================

  private standardDeviation(
    values: number[]
  ): number {
    if (
      values.length === 0
    ) {
      return 0;
    }

    const average =
      this.mean(values);

    const variance =
      this.mean(
        values.map(
          (value) =>
            Math.pow(
              value -
                average,
              2
            )
        )
      );

    return Math.sqrt(
      variance
    );
  }

  // ==========================================
  // DIAGNOSTICS
  // ==========================================

  getDiagnostics() {
    return {
      stage:
        this.currentStage,

      acceleration:
        this.lastAcceleration,

      rotation:
        this.lastRotation,

      jerk:
        this.lastJerk,

      eventMaxJerk:
        this.eventMaxJerk,

      lastEventMaxJerk:
        this.lastEventMaxJerk,

      fallScore:
        this.lastFallScore,

      candidateImpact:
        this.candidateImpact,

      lastImpactDetected:
        this.lastImpactDetected,

      candidateImpactMagnitude:
        this.candidateImpact
          ? this.candidateImpactMagnitude
          : this.lastImpactMagnitude,

      lastImpactMagnitude:
        this.lastImpactMagnitude,

      postImpactRotation:
        this.lastPostImpactRotation,

      bufferSize:
        this.motionBuffer.length,
    };
  }

  // ==========================================
  // RESET ACTIVE EVENT
  // ==========================================

  private resetActiveEvent(): void {
    this.candidateImpact =
      false;

    this.candidateImpactTime =
      0;

    this.candidateImpactMagnitude =
      0;

    this.eventMaxJerk =
      0;
  }

  // ==========================================
  // FULL RESET
  // ==========================================

  reset(): void {
    this.motionBuffer = [];

    this.candidateImpact =
      false;

    this.candidateImpactTime =
      0;

    this.candidateImpactMagnitude =
      0;

    this.eventMaxJerk =
      0;

    this.lastImpactDetected =
      false;

    this.lastImpactMagnitude =
      0;

    this.lastEventMaxJerk =
      0;

    this.lastPostImpactRotation =
      0;

    this.cooldownUntil =
      0;

    this.currentStage =
      "NORMAL";

    this.lastAcceleration =
      0;

    this.lastRotation =
      0;

    this.lastJerk =
      0;

    this.lastFallScore =
      0;
  }
}

export default new FallDetectionService();