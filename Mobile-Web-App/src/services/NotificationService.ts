import type { GPSData } from "../types/sensor";

class NotificationService {
  private permission: NotificationPermission =
    "default";

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn(
        "Browser notifications are not supported."
      );
      return false;
    }

    try {
      this.permission =
        await Notification.requestPermission();

      console.log(
        "Notification permission:",
        this.permission
      );

      return this.permission === "granted";
    } catch (error) {
      console.error(
        "Notification permission request failed:",
        error
      );

      return false;
    }
  }

  async sendEmergencyNotification(
    location?: GPSData | null
  ): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn(
        "Browser notifications are not supported."
      );
      return false;
    }

    if (Notification.permission !== "granted") {
      console.warn(
        "Notification permission has not been granted."
      );
      return false;
    }

    let locationText =
      "Location unavailable";

    if (location) {
      locationText =
        `Latitude: ${location.latitude.toFixed(6)}, ` +
        `Longitude: ${location.longitude.toFixed(6)}`;
    }

    try {
      new Notification(
        "🚨 Sentinel Emergency Alert",
        {
          body:
            "A possible fall has been detected. " +
            `Emergency confirmed.\n${locationText}`,
          tag: "sentinel-emergency",
          requireInteraction: true,
        }
      );

      console.log(
        "🚨 Emergency notification sent."
      );

      return true;
    } catch (error) {
      console.error(
        "Failed to send emergency notification:",
        error
      );

      return false;
    }
  }

  isSupported(): boolean {
    return "Notification" in window;
  }

  isGranted(): boolean {
    return (
      "Notification" in window &&
      Notification.permission === "granted"
    );
  }

  getPermission(): NotificationPermission {
    if (!("Notification" in window)) {
      return "denied";
    }

    return Notification.permission;
  }
}

export default new NotificationService();