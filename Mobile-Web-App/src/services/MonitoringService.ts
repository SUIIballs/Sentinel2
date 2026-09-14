import SensorService from "./SensorService";
import LocationService from "./LocationService";
import FallDetectionService from "./FallDetectionService";

import type {
  MotionSensorData,
  GPSData,
} from "../types/sensor";

class MonitoringService {
  // ==========================================
  // CALLBACKS
  // ==========================================

  private emergencyCallback?: () => void;

  private sensorCallback?: (
    data: MotionSensorData
  ) => void;

  private locationCallback?: (
    data: GPSData
  ) => void;

  // ==========================================
  // LATEST DATA
  // ==========================================

  private latestSensor:
    MotionSensorData | null = null;

  private latestLocation:
    GPSData | null = null;

  // ==========================================
  // MONITORING STATE
  // ==========================================

  private isRunning = false;

  // ==========================================
  // START MONITORING
  // ==========================================

  async start(
    onEmergency?: () => void,
    onSensorUpdate?: (
      data: MotionSensorData
    ) => void,
    onLocationUpdate?: (
      data: GPSData
    ) => void
  ): Promise<boolean> {
    // Prevent duplicate monitoring
    if (this.isRunning) {
      console.log(
        "MonitoringService is already running."
      );

      return true;
    }

    console.log(
      "Starting MonitoringService..."
    );

    // Store callbacks
    this.emergencyCallback =
      onEmergency;

    this.sensorCallback =
      onSensorUpdate;

    this.locationCallback =
      onLocationUpdate;

    // ==========================================
    // RESET FALL DETECTION
    // ==========================================

    FallDetectionService.reset();

    // ==========================================
    // START SENSOR SERVICE
    // ==========================================

    const sensorStarted =
      await SensorService.start(
        (data: MotionSensorData) => {
          // ------------------------------------
          // STORE LATEST SENSOR DATA
          // ------------------------------------

          this.latestSensor = data;

          // ------------------------------------
          // SEND DATA TO UI
          // ------------------------------------

          this.sensorCallback?.(data);

          // ------------------------------------
          // FALL DETECTION
          // ------------------------------------

          const fallDetected =
            FallDetectionService.detectFall(
              data
            );

          // ------------------------------------
          // CONFIRMED FALL
          // ------------------------------------

          if (fallDetected) {
            console.log(
              "🚨 Fall confirmed by MonitoringService."
            );

            this.emergencyCallback?.();
          }
        }
      );

    // ==========================================
    // SENSOR START FAILED
    // ==========================================

    if (!sensorStarted) {
      console.warn(
        "Failed to start SensorService."
      );

      return false;
    }

    // ==========================================
    // START GPS SERVICE
    // ==========================================

    const locationStarted =
      await LocationService.start(
        (data: GPSData) => {
          // ------------------------------------
          // STORE LATEST LOCATION
          // ------------------------------------

          this.latestLocation = data;

          // ------------------------------------
          // SEND LOCATION TO UI
          // ------------------------------------

          this.locationCallback?.(
            data
          );
        }
      );

    // GPS failure should NOT stop motion
    // monitoring from working.
    if (!locationStarted) {
      console.warn(
        "GPS could not be started."
      );
    }

    // ==========================================
    // MONITORING ACTIVE
    // ==========================================

    this.isRunning = true;

    console.log(
      "✅ MonitoringService started successfully."
    );

    return true;
  }

  // ==========================================
  // STOP MONITORING
  // ==========================================

  stop(): void {
    console.log(
      "Stopping MonitoringService..."
    );

    // Stop sensors
    SensorService.stop();

    // Stop GPS
    LocationService.stop();

    // Reset fall detector
    FallDetectionService.reset();

    // Reset monitoring state
    this.isRunning = false;

    // Clear callbacks
    this.emergencyCallback =
      undefined;

    this.sensorCallback =
      undefined;

    this.locationCallback =
      undefined;

    // Clear latest data
    this.latestSensor = null;
    this.latestLocation = null;

    console.log(
      "MonitoringService stopped."
    );
  }

  // ==========================================
  // MONITORING STATUS
  // ==========================================

  get running(): boolean {
    return this.isRunning;
  }

  // ==========================================
  // LATEST SENSOR DATA
  // ==========================================

  getLatestSensor():
    MotionSensorData | null {
    return this.latestSensor;
  }

  // ==========================================
  // LATEST GPS LOCATION
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

    FallDetectionService.reset();

    console.log(
      "MonitoringService reset."
    );
  }
}

export default new MonitoringService();