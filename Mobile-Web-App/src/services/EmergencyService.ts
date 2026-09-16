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
          "✅ Emergency alert sent to all configured contacts."
        );
      } else {
        console.warn(
          "⚠️ One or more emergency alerts could not be sent."
        );
      }
    } else {
      console.warn(
        "⚠️ No GPS location available. Backend alert not sent."
      );
    }

    console.log(
      "History:",
      HistoryService.getIncidents()
    );

    this.triggerCallback?.();
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