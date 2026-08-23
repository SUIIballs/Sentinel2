import type { MotionSensorData } from "../types/sensor";

interface AccelerationSample {
  time: number;
  magnitude: number;
}

class FallDetectionService {
  // ==========================================
  // DETECTION PARAMETERS
  // ==========================================

  /**
   * Minimum acceleration magnitude required
   * before an event can become a candidate impact.
   */
  private readonly IMPACT_THRESHOLD = 20.0;

  /**
   * Pre-impact acceleration threshold.
   *
   * A significant reduction toward this value
   * provides evidence of a fall before impact.
   */
  private readonly FREE_FALL_THRESHOLD = 8.0;

  /**
   * Amount of sensor history retained before
   * a candidate impact.
   */
  private readonly PRE_IMPACT_WINDOW = 1000;

  /**
   * Amount of sensor data observed after impact.
   */
  private readonly POST_IMPACT_WINDOW = 1200;

  /**
   * Prevents repeated detection immediately
   * after a confirmed event.
   */
  private readonly COOLDOWN_TIME = 3000;

  /**
   * Final weighted score required for confirmation.
   */
  private readonly FALL_SCORE_THRESHOLD = 0.68;

  // ==========================================
  // SCORE WEIGHTS
  // ==========================================

  /**
   * Impact is the strongest direct signal.
   */
  private readonly IMPACT_WEIGHT = 0.35;

  /**
   * Pre-impact acceleration drop.
   */
  private readonly PRE_IMPACT_WEIGHT = 0.25;

  /**
   * Maximum jerk during the complete event.
   */
  private readonly JERK_WEIGHT = 0.25;

  /**
   * Post-impact behavior.
   */
  private readonly POST_IMPACT_WEIGHT = 0.15;

  // ==========================================
  // JERK PARAMETERS
  // ==========================================

  private readonly HIGH_JERK_START = 300;
  private readonly HIGH_JERK_FULL = 1000;

  // ==========================================
  // BUFFER
  // ==========================================

  private accelerationBuffer: AccelerationSample[] = [];

  // ==========================================
  // ACTIVE EVENT STATE
  // ==========================================

  /**
   * True only while a candidate event is being
   * analyzed.
   */
  private candidateImpact = false;

  private candidateImpactTime = 0;

  private candidateImpactMagnitude = 0;

  /**
   * Maximum jerk observed during the current
   * candidate event.
   */
  private eventMaxJerk = 0;

  // ==========================================
  // PERSISTENT EVENT DIAGNOSTICS
  // ==========================================

  /**
   * Remains true after an impact has been detected
   * so the UI can display the last detected event.
   */
  private lastImpactDetected = false;

  /**
   * Preserves the magnitude of the last detected
   * impact after analysis has finished.
   */
  private lastImpactMagnitude = 0;

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
  // MAIN DETECTOR
  // ==========================================

  detectFall(
    data: MotionSensorData
  ): boolean {
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

    // ==========================================
    // STORE CURRENT SENSOR VALUES
    // ==========================================

    this.lastAcceleration =
      magnitude;

    this.lastRotation =
      rotationMagnitude;

    // ==========================================
    // BUFFER SAMPLE
    // ==========================================

    this.addSample(
      now,
      magnitude
    );

    // ==========================================
    // CURRENT JERK
    // ==========================================

    const jerk =
      this.calculateCurrentJerk();

    this.lastJerk = jerk;

    // ==========================================
    // ACTIVE EVENT ANALYSIS
    // ==========================================

    if (
      this.candidateImpact
    ) {
      this.currentStage =
        "ANALYZING";

      /**
       * IMPORTANT:
       *
       * Store the maximum jerk across the
       * entire event rather than using the
       * final sample's jerk.
       */
      if (
        jerk >
        this.eventMaxJerk
      ) {
        this.eventMaxJerk =
          jerk;
      }

      const elapsed =
        now -
        this.candidateImpactTime;

      // ========================================
      // ANALYSIS COMPLETE
      // ========================================

      if (
        elapsed >=
        this.POST_IMPACT_WINDOW
      ) {
        const fallScore =
          this.calculateFallScore();

        this.lastFallScore =
          fallScore;

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

            lastJerk:
              this.lastJerk.toFixed(
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

          this.currentStage =
            "FALL_CONFIRMED";

          this.cooldownUntil =
            now +
            this.COOLDOWN_TIME;

          /**
           * Clear only the ACTIVE event.
           *
           * Keep diagnostic evidence so the UI
           * can still show what happened.
           */
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
      now <
      this.cooldownUntil
    ) {
      return false;
    }

    // ==========================================
    // CANDIDATE IMPACT DETECTION
    // ==========================================

    const hasPreImpactDrop =
      this.hasRecentLowAcceleration();

    /**
     * We deliberately do NOT use a simple
     * "rapid acceleration change" condition here.
     *
     * The previous implementation allowed:
     *
     *   high acceleration
     *   +
     *   sudden change
     *
     * to create a candidate.
     *
     * That caused ordinary movement to trigger
     * false candidates.
     *
     * A candidate now needs either:
     *
     *   1. meaningful pre-impact acceleration drop
     *
     * OR
     *
     *   2. sufficiently high jerk.
     */
    const possibleImpact =
      magnitude >=
        this.IMPACT_THRESHOLD &&
      (
        hasPreImpactDrop ||
        jerk >=
          this.HIGH_JERK_START
      );

    if (
      possibleImpact
    ) {
      this.candidateImpact =
        true;

      this.candidateImpactTime =
        now;

      this.candidateImpactMagnitude =
        magnitude;

      /**
       * Preserve the event for diagnostics.
       */
      this.lastImpactDetected =
        true;

      this.lastImpactMagnitude =
        magnitude;

      /**
       * Start maximum jerk tracking
       * from this event.
       */
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

          preImpactDrop:
            hasPreImpactDrop,
        }
      );

      return false;
    }

    // ==========================================
    // NORMAL MONITORING
    // ==========================================

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

    return false;
  }

  // ==========================================
  // BUFFER MANAGEMENT
  // ==========================================

  private addSample(
    time: number,
    magnitude: number
  ): void {
    this.accelerationBuffer.push({
      time,
      magnitude,
    });

    const cutoff =
      time -
      this.PRE_IMPACT_WINDOW -
      this.POST_IMPACT_WINDOW -
      500;

    this.accelerationBuffer =
      this.accelerationBuffer.filter(
        (sample) =>
          sample.time >=
          cutoff
      );
  }

 

  // ==========================================
  // JERK
  // ==========================================

  private calculateCurrentJerk(): number {
    if (
      this.accelerationBuffer.length <
      2
    ) {
      return 0;
    }

    const current =
      this.accelerationBuffer[
        this.accelerationBuffer.length -
          1
      ];

    const previous =
      this.accelerationBuffer[
        this.accelerationBuffer.length -
          2
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
      ) /
      deltaTime
    );
  }

  // ==========================================
  // PRE-IMPACT ANALYSIS
  // ==========================================

  private hasRecentLowAcceleration(): boolean {
    if (
      this.accelerationBuffer.length ===
      0
    ) {
      return false;
    }

    const now =
      this.accelerationBuffer[
        this.accelerationBuffer.length -
          1
      ].time;

    const recent =
      this.accelerationBuffer.filter(
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
  // FALL SCORE
  // ==========================================

  private calculateFallScore(): number {
    const impactTime =
      this.candidateImpactTime;

    const preImpactSamples =
      this.accelerationBuffer.filter(
        (sample) =>
          sample.time >=
            impactTime -
              this.PRE_IMPACT_WINDOW &&
          sample.time <
            impactTime
      );

    const postImpactSamples =
      this.accelerationBuffer.filter(
        (sample) =>
          sample.time >
            impactTime &&
          sample.time <=
            impactTime +
              this.POST_IMPACT_WINDOW
      );

    if (
      preImpactSamples.length ===
        0 ||
      postImpactSamples.length ===
        0
    ) {
      return 0;
    }

    // ========================================
    // FEATURE 1: IMPACT
    // ========================================

    const impactScore =
      this.normalize(
        this.candidateImpactMagnitude,
        18,
        32
      );

    // ========================================
    // FEATURE 2: PRE-IMPACT DROP
    // ========================================

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

    // ========================================
    // FEATURE 3: MAX EVENT JERK
    // ========================================

    /**
     * IMPORTANT:
     *
     * We now use eventMaxJerk instead of
     * lastJerk.
     */
    const jerkScore =
      this.normalize(
        this.eventMaxJerk,
        this.HIGH_JERK_START,
        this.HIGH_JERK_FULL
      );

    // ========================================
    // FEATURE 4: POST-IMPACT RESPONSE
    // ========================================

    const postMagnitudes =
      postImpactSamples.map(
        (sample) =>
          sample.magnitude
      );

    const postStd =
      this.standardDeviation(
        postMagnitudes
      );

    /**
     * Lower post-impact variation indicates
     * settling/inactivity.
     */
    const postImpactStability =
      1 -
      this.normalize(
        postStd,
        0,
        8
      );

    /**
     * Look at the final 400 ms of the event.
     */
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
        finalStability * 0.7 +
          postImpactStability *
            0.3,
        0,
        1
      );

    // ========================================
    // FINAL WEIGHTED SCORE
    // ========================================

    let score =
      impactScore *
        this.IMPACT_WEIGHT +
      preImpactScore *
        this.PRE_IMPACT_WEIGHT +
      jerkScore *
        this.JERK_WEIGHT +
      postImpactScore *
        this.POST_IMPACT_WEIGHT;

    /**
     * IMPORTANT SAFETY RULE:
     *
     * A high score should not be possible from
     * impact + stability alone.
     *
     * Require meaningful evidence from either:
     *
     *   - pre-impact drop
     *   OR
     *   - strong jerk
     *
     * before allowing a confirmation.
     */
    const temporalEvidence =
      preImpactScore >= 0.25 ||
      jerkScore >= 0.50;

    if (
      !temporalEvidence
    ) {
      score *= 0.55;
    }

    return this.clamp(
      score,
      0,
      1
    );
  }

  // ==========================================
  // MATH HELPERS
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
      ) /
      values.length
    );
  }

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

      /**
       * Maximum jerk from the active event.
       */
      eventMaxJerk:
        this.eventMaxJerk,

      fallScore:
        this.lastFallScore,

      /**
       * Current active candidate.
       */
      candidateImpact:
        this.candidateImpact,

      /**
       * Persistent evidence that an impact
       * was detected recently.
       */
      lastImpactDetected:
        this.lastImpactDetected,

      /**
       * Persistent last impact magnitude.
       */
      candidateImpactMagnitude:
        this.candidateImpact
          ? this.candidateImpactMagnitude
          : this.lastImpactMagnitude,

      lastImpactMagnitude:
        this.lastImpactMagnitude,

      bufferSize:
        this.accelerationBuffer.length,
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
    this.accelerationBuffer =
      [];

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