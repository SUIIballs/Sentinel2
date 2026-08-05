import HistoryService from "./HistoryService";
import MonitoringService from "./MonitoringService";

class EmergencyService {
  private timer: number | null = null;
  private secondsRemaining = 10;

  private tickCallback?: (seconds: number) => void;
  private finishCallback?: () => void;

  /**
   * Starts emergency countdown.
   */
  startCountdown(
    onTick: (seconds: number) => void,
    onFinish: () => void,
    duration = 10
  ) {
    this.stop();

    this.secondsRemaining = duration;

    this.tickCallback = onTick;
    this.finishCallback = onFinish;

    this.tickCallback(this.secondsRemaining);

    this.timer = window.setInterval(() => {
      this.secondsRemaining--;

      this.tickCallback?.(this.secondsRemaining);

      if (this.secondsRemaining <= 0) {
        this.stop();

        this.triggerEmergency();

        this.finishCallback?.();
      }
    }, 1000);
  }

  /**
   * Trigger emergency.
   */
  triggerEmergency() {
    console.log("🚨 Emergency Triggered");

    const gps =
      MonitoringService.getLatestLocation();

    HistoryService.addIncident({
      id: crypto.randomUUID(),

      timestamp: Date.now(),

      latitude: gps?.latitude ?? 0,

      longitude: gps?.longitude ?? 0,

      accuracy: gps?.accuracy ?? 0,

      reason: "Fall Detected",

      cancelled: false,
    });

    console.log(
      "Incident Saved:",
      HistoryService.getIncidents()
    );

    // Future:
    // Send SMS
    // Call emergency contact
    // Upload to backend
  }

  /**
   * Cancel emergency.
   */
  cancel() {
    console.log("Emergency Cancelled");

    this.stop();
  }

  /**
   * Stop countdown.
   */
  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);

      this.timer = null;
    }

    this.secondsRemaining = 10;
  }

  /**
   * Countdown active?
   */
  isRunning() {
    return this.timer !== null;
  }

  /**
   * Remaining time.
   */
  getRemainingTime() {
    return this.secondsRemaining;
  }
}

export default new EmergencyService();