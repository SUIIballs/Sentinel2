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

  private emergencyCompleted = false;

  startCountdown(
    onTick: (seconds: number) => void,
    onFinish: () => void,
    duration = 10
  ): void {
    if (this.emergencyActive) {
      console.log(
        "⚠️ Emergency already active. Countdown not started."
      );

      return;
    }

    this.stop();

    this.duration = duration;
    this.secondsRemaining = duration;

    this.tickCallback = onTick;
    this.finishCallback = onFinish;

    this.emergencyCompleted = false;

    console.log(
      "⚠️ Emergency countdown started:",
      duration
    );

    this.tickCallback?.(
      this.secondsRemaining
    );

    this.timer = window.setInterval(
      () => {
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

        if (
          this.secondsRemaining <= 0
        ) {
          const finishCallback =
            this.finishCallback;

          this.stop();

          void this.completeEmergency(
            finishCallback
          );
        }
      },
      1000
    );
  }

  private async completeEmergency(
    finishCallback?: () => void
  ): Promise<void> {
    if (this.emergencyCompleted) {
      console.log(
        "⚠️ Emergency already completed. Duplicate alert prevented."
      );

      return;
    }

    await this.triggerEmergency();

    if (this.emergencyActive) {
      this.emergencyCompleted = true;

      finishCallback?.();
    }
  }

  async triggerEmergency(): Promise<void> {
    if (this.emergencyActive) {
      console.log(
        "⚠️ Emergency already active. Duplicate trigger prevented."
      );

      return;
    }

    console.log(
      "🚨 EMERGENCY TRIGGERED"
    );

    /*
     * Clear the previous emergency's
     * backend/contact status.
     */
    EmergencyAlertService.resetDebug();

    this.emergencyActive = true;

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

    /*
     * Always save the emergency incident,
     * even if GPS is unavailable.
     */
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

    /*
     * IMPORTANT:
     *
     * Show the emergency UI immediately.
     * Do NOT wait for the backend or
     * simulated SMS processing.
     */
    this.triggerCallback?.();

    /*
     * Finish the countdown immediately
     * so the UI does not wait for the
     * network request.
     */
    if (gps) {
      console.log(
        "📤 Starting emergency alert processing in background..."
      );

      void EmergencyAlertService
        .sendEmergencyAlert(
          gps,
          "Fall Detected"
        )
        .then((alertSent) => {
          if (alertSent) {
            console.log(
              "✅ Emergency alert sent to all configured contacts."
            );
          } else {
            console.warn(
              "⚠️ One or more emergency alerts could not be sent."
            );
          }
        })
        .catch((error) => {
          console.error(
            "❌ Emergency alert processing failed:",
            error
          );
        });
    } else {
      console.warn(
        "⚠️ No GPS location available."
      );

      console.warn(
        "⚠️ Emergency incident was saved locally."
      );

      console.warn(
        "⚠️ Backend alert was not sent because location was unavailable."
      );
    }

    console.log(
      "History:",
      HistoryService.getIncidents()
    );
  }

  cancel(): void {
    if (
      this.timer === null &&
      !this.emergencyActive
    ) {
      console.log(
        "No active emergency to cancel."
      );

      return;
    }

    console.log(
      "✅ Emergency cancelled by user."
    );

    this.stop();

    this.emergencyActive = false;

    this.emergencyCompleted = false;

    this.cancelCallback?.();
  }

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

  reset(): void {
    console.log(
      "EmergencyService reset."
    );

    this.stop();

    this.emergencyActive = false;

    this.emergencyCompleted = false;

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

    EmergencyAlertService.resetDebug();
  }

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