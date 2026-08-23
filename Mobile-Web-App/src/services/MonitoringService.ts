import SensorService from "./SensorService";
import LocationService from "./LocationService";
import FallDetectionService from "./FallDetectionService";

import type {
  MotionSensorData,
  GPSData,
} from "../types/sensor";

class MonitoringService {
  private emergencyCallback?: () => void;

  private sensorCallback?: (
    data: MotionSensorData
  ) => void;

  private locationCallback?: (
    data: GPSData
  ) => void;

  private latestSensor:
    MotionSensorData | null = null;

  private latestLocation:
    GPSData | null = null;

  async start(
    onEmergency?: () => void,
    onSensorUpdate?: (
      data: MotionSensorData
    ) => void,
    onLocationUpdate?: (
      data: GPSData
    ) => void
  ): Promise<boolean> {
    console.log(
      "MonitoringService started."
    );

    this.emergencyCallback =
      onEmergency;

    this.sensorCallback =
      onSensorUpdate;

    this.locationCallback =
      onLocationUpdate;

    // ==========================================
    // SENSOR MONITORING
    // ==========================================

    const sensorStarted =
      await SensorService.start(
        (data: MotionSensorData) => {
          // Store latest sensor data
          this.latestSensor = data;

          // Send sensor data to UI
          this.sensorCallback?.(data);

          // ========================================
          // FALL DETECTION
          // ========================================

          if (
            FallDetectionService.detectFall(
              data
            )
          ) {
            console.log(
              "Fall detected by MonitoringService."
            );

            this.emergencyCallback?.();
          }
        }
      );

    if (!sensorStarted) {
      console.warn(
        "Failed to start SensorService."
      );

      return false;
    }

    // ==========================================
    // GPS MONITORING
    // ==========================================

    const locationStarted =
      await LocationService.start(
        (data) => {
          this.latestLocation = data;

          this.locationCallback?.(
            data
          );
        }
      );

    if (!locationStarted) {
      console.warn(
        "Failed to start LocationService."
      );
    }

    return true;
  }

  // ==========================================
  // STOP MONITORING
  // ==========================================

  stop(): void {
    console.log(
      "MonitoringService stopped."
    );

    SensorService.stop();
    LocationService.stop();
  }

  // ==========================================
  // GET LATEST SENSOR DATA
  // ==========================================

  getLatestSensor():
    MotionSensorData | null {
    return this.latestSensor;
  }

  // ==========================================
  // GET LATEST LOCATION
  // ==========================================

  getLatestLocation():
    GPSData | null {
    return this.latestLocation;
  }

  // ==========================================
  // RESET
  // ==========================================

  reset(): void {
    this.latestSensor = null;
    this.latestLocation = null;
  }
}

export default new MonitoringService();