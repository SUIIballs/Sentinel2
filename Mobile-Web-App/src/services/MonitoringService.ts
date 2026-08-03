import SensorService from "./SensorService";
import LocationService from "./LocationService";
import FallDetectionService from "./FallDetectionService";

import type {
  AccelerometerData,
  GPSData,
} from "../types/sensor";

class MonitoringService {
  private emergencyCallback?: () => void;
  private sensorCallback?: (
    data: AccelerometerData
  ) => void;
  private locationCallback?: (
    data: GPSData
  ) => void;

  private latestSensor: AccelerometerData | null = null;
  private latestLocation: GPSData | null = null;

  /**
   * Starts monitoring.
   */
  async start(
    onEmergency?: () => void,
    onSensorUpdate?: (
      data: AccelerometerData
    ) => void,
    onLocationUpdate?: (
      data: GPSData
    ) => void
  ): Promise<boolean> {
    this.emergencyCallback = onEmergency;
    this.sensorCallback = onSensorUpdate;
    this.locationCallback = onLocationUpdate;

    const sensorStarted =
      await SensorService.start((data) => {
        this.latestSensor = data;

        this.sensorCallback?.(data);

        const detected =
          FallDetectionService.detectFall(data);

        if (detected) {
          this.emergencyCallback?.();
        }
      });

    if (!sensorStarted) {
      return false;
    }

    await LocationService.start((data) => {
      this.latestLocation = data;

      this.locationCallback?.(data);
    });

    return true;
  }

  /**
   * Stops monitoring.
   */
  stop(): void {
    SensorService.stop();
    LocationService.stop();
  }

  /**
   * Latest accelerometer reading.
   */
  getLatestSensor(): AccelerometerData | null {
    return this.latestSensor;
  }

  /**
   * Latest GPS reading.
   */
  getLatestLocation(): GPSData | null {
    return this.latestLocation;
  }

  /**
   * Clears cached sensor data.
   */
  reset(): void {
    this.latestSensor = null;
    this.latestLocation = null;
  }
}

export default new MonitoringService();