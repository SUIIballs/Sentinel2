import HistoryService from "./HistoryService";
import MonitoringService from "./MonitoringService";
import LocationService from "./LocationService";
import EmergencyAlertService from "./EmergencyAlertService";

class EmergencyService {
  private timer: number | null = null;

  private secondsRemaining = 10;

  private duration = 10;

  private tickCallback?: (
    seconds: number
  ) => void;

  private finishCallback?: () => void;

  private triggerCallback?: () => void;

  private cancelCallback?: () => void;

  private emergencyActive = false;

  // ==========================================
  // START COUNTDOWN
  // ==========================================

  startCountdown(
    onTick: (seconds: number) => void,
    onFinish: () => void,
    duration = 10
  ): void {
    /*
     * Always stop an existing countdown
     * before starting a new one.
     */
    this.stop();

    this.duration = duration;

    this.secondsRemaining = duration;

    this.tickCallback = onTick;

    this.finishCallback = onFinish;

    console.log(
      "⚠️ Emergency countdown started:",
      duration
    );

    /*
     * Immediately display the starting
     * countdown value.
     */
    this.tickCallback?.(
      this.secondsRemaining
    );

    this.timer = window.setInterval(
      () => {
        /*
         * Safety check:
         * if the timer was stopped, do nothing.
         */
        if (this.timer === null) {
          return;
        }

        this.secondsRemaining--;

        console.log(
          "Emergency countdown:",
          this.secondsRemaining
        );

        this.tickCallback?.(
          this.secondsRemaining
        );

        /*
         * Countdown finished.
         */
        if (
          this.secondsRemaining <= 0
        ) {
          /*
           * Save the callback before stopping.
           */
          const finishCallback =
            this.finishCallback;

          /*
           * Stop the timer immediately.
           */
          this.stop();

          /*
           * Process emergency asynchronously.
           */
          void this.completeEmergency(
            finishCallback
          );
        }
      },
      1000
    );
  }

  // ==========================================
  // COMPLETE EMERGENCY
  // ==========================================

  private async completeEmergency(
    finishCallback?: () => void
  ): Promise<void> {
    /*
     * Trigger the emergency and wait for
     * GPS/history/backend processing.
     */
    await this.triggerEmergency();

    /*
     * Only notify HomePage if the emergency
     * wasn't cancelled/reset during processing.
     */
    if (this.emergencyActive) {
      finishCallback?.();
    }
  }

  // ==========================================
  // TRIGGER EMERGENCY
  // ==========================================

  async triggerEmergency(): Promise<void> {
    /*
     * Prevent duplicate emergency processing.
     */
    if (this.emergencyActive) {
      console.log(
        "Emergency already active."
      );

      return;
    }

    console.log(
      "🚨 EMERGENCY TRIGGERED"
    );

    this.emergencyActive = true;

    // ========================================
    // GET GPS
    // ========================================

    let gps =
      MonitoringService.getLatestLocation();

    if (!gps) {
      gps =
        LocationService.getLatestLocation();
    }

    console.log(
      "📍 Emergency GPS:",
      gps
    );

    // ========================================
    // SAVE TO HISTORY
    // ========================================

    HistoryService.addIncident({
      id: crypto.randomUUID(),

      timestamp: Date.now(),

      latitude:
        gps?.latitude ?? 0,

      longitude:
        gps?.longitude ?? 0,

      accuracy:
        gps?.accuracy ?? 0,

      reason:
        "Fall Detected",

      cancelled: false,
    });

    console.log(
      "📋 Emergency incident saved."
    );

    // ========================================
    // SEND BACKEND ALERT
    // ========================================

    if (gps) {
      console.log(
        "📤 Sending emergency alert..."
      );

      const alertSent =
        await EmergencyAlertService.sendEmergencyAlert(
          gps,
          "Fall Detected"
        );

      if (alertSent) {
        console.log(
          "✅ Emergency alert sent to backend."
        );
      } else {
        console.warn(
          "⚠️ Emergency alert could not be sent to backend."
        );
      }
    } else {
      console.warn(
        "⚠️ No GPS location available. Backend alert not sent."
      );
    }

    // ========================================
    // HISTORY LOG
    // ========================================

    console.log(
      "History:",
      HistoryService.getIncidents()
    );

    // ========================================
    // TRIGGER CALLBACK
    // ========================================

    this.triggerCallback?.();
  }

  // ==========================================
  // CANCEL
  // ==========================================

  cancel(): void {
    console.log(
      "✅ Emergency cancelled by user."
    );

    this.stop();

    this.emergencyActive = false;

    this.cancelCallback?.();
  }

  // ==========================================
  // STOP COUNTDOWN
  // ==========================================

  stop(): void {
    if (
      this.timer !== null
    ) {
      window.clearInterval(
        this.timer
      );

      this.timer = null;
    }

    this.secondsRemaining =
      this.duration;
  }

  // ==========================================
  // RESET EVERYTHING
  // ==========================================

  reset(): void {
    console.log(
      "EmergencyService reset."
    );

    this.stop();

    this.emergencyActive = false;

    this.tickCallback =
      undefined;

    this.finishCallback =
      undefined;

    this.triggerCallback =
      undefined;

    this.cancelCallback =
      undefined;

    this.secondsRemaining =
      this.duration;
  }

  // ==========================================
  // CALLBACKS
  // ==========================================

  setTriggerCallback(
    callback: () => void
  ): void {
    this.triggerCallback =
      callback;
  }

  setCancelCallback(
    callback: () => void
  ): void {
    this.cancelCallback =
      callback;
  }

  // ==========================================
  // STATUS
  // ==========================================

  isRunning(): boolean {
    return this.timer !== null;
  }

  isEmergencyActive(): boolean {
    return this.emergencyActive;
  }

  getRemainingTime(): number {
    return this.secondsRemaining;
  }
}

export default new EmergencyService();