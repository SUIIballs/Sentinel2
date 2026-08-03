import type { GPSData } from "../types/sensor";

class LocationService {
  private watchId: number | null = null;
  private isRunning = false;

  /**
   * Starts GPS tracking.
   * Returns true if GPS monitoring started successfully.
   */
  async start(
    callback: (data: GPSData) => void
  ): Promise<boolean> {
    // Prevent duplicate watchers
    if (this.isRunning) {
      return true;
    }

    // Check browser support
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation is not supported on this device.");
      return false;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.warn("Location permission denied.");
            break;

          case error.POSITION_UNAVAILABLE:
            console.warn("Location unavailable.");
            break;

          case error.TIMEOUT:
            console.warn("Location request timed out.");
            break;

          default:
            console.warn("Unknown location error.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    this.isRunning = true;

    return true;
  }

  /**
   * Stops GPS tracking.
   */
  stop(): void {
    if (this.watchId === null) {
      return;
    }

    navigator.geolocation.clearWatch(this.watchId);

    this.watchId = null;
    this.isRunning = false;
  }

  /**
   * Returns whether GPS tracking is active.
   */
  get running(): boolean {
    return this.isRunning;
  }
}

export default new LocationService();