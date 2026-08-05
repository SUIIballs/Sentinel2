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

  async start(
    onEmergency?: () => void,
    onSensorUpdate?: (
      data: AccelerometerData
    ) => void,
    onLocationUpdate?: (
      data: GPSData
    ) => void
  ): Promise<boolean> {
    console.log("MonitoringService started.");

    this.emergencyCallback = onEmergency;
    this.sensorCallback = onSensorUpdate;
    this.locationCallback = onLocationUpdate;

    const sensorStarted = await SensorService.start(
      (data) => {
        this.latestSensor = data;

        this.sensorCallback?.(data);

        if (
          FallDetectionService.detectFall(data)
        ) {
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

    const locationStarted =
      await LocationService.start((data) => {
        this.latestLocation = data;

        this.locationCallback?.(data);
      });

    if (!locationStarted) {
      console.warn(
        "Failed to start LocationService."
      );
    }

    return true;
  }

  stop(): void {
    console.log("MonitoringService stopped.");

    SensorService.stop();
    LocationService.stop();
  }

  getLatestSensor(): AccelerometerData | null {
    return this.latestSensor;
  }

  getLatestLocation(): GPSData | null {
    return this.latestLocation;
  }

  reset(): void {
    this.latestSensor = null;
    this.latestLocation = null;
  }
}

export default new MonitoringService();