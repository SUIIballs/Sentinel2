import type { GPSData } from "../types/sensor";

class LocationService {
  private watchId: number | null = null;

  private isRunning = false;

  private latestLocation: GPSData | null = null;

  // ==========================================
  // START GPS TRACKING
  // ==========================================

  async start(
    callback: (data: GPSData) => void
  ): Promise<boolean> {
    // Prevent duplicate watchers
    if (this.isRunning) {
      return true;
    }

    // Check browser support
    if (!("geolocation" in navigator)) {
      console.warn(
        "Geolocation is not supported on this device."
      );

      return false;
    }

    console.log(
      "Starting GPS monitoring..."
    );

    this.watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          const gpsData: GPSData = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,

            timestamp:
              position.timestamp,
          };

          // Store latest GPS position
          this.latestLocation =
            gpsData;

          console.log(
            "GPS Location:",
            gpsData
          );

          // Send location to caller
          callback(gpsData);
        },

        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.warn(
                "Location permission denied."
              );
              break;

            case error.POSITION_UNAVAILABLE:
              console.warn(
                "Location unavailable."
              );
              break;

            case error.TIMEOUT:
              console.warn(
                "Location request timed out."
              );
              break;

            default:
              console.warn(
                "Unknown location error."
              );
          }
        },

        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );

    this.isRunning = true;

    console.log(
      "GPS monitoring started successfully."
    );

    return true;
  }

  // ==========================================
  // STOP GPS TRACKING
  // ==========================================

  stop(): void {
    if (
      this.watchId === null
    ) {
      return;
    }

    navigator.geolocation.clearWatch(
      this.watchId
    );

    this.watchId = null;

    this.isRunning = false;

    console.log(
      "GPS monitoring stopped."
    );
  }

  // ==========================================
  // GET LATEST LOCATION
  // ==========================================

  getLatestLocation():
    GPSData | null {
    return this.latestLocation;
  }

  // ==========================================
  // CLEAR STORED LOCATION
  // ==========================================

  reset(): void {
    this.latestLocation = null;
  }

  // ==========================================
  // RUNNING STATUS
  // ==========================================

  get running(): boolean {
    return this.isRunning;
  }
}

export default new LocationService();