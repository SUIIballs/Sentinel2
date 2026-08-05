import { useCallback, useState } from "react";

import MonitoringService from "../services/MonitoringService";
import SensorService from "../services/SensorService";

import type {
  AccelerometerData,
  GPSData,
} from "../types/sensor";

export default function useMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(false);

  const [sensor, setSensor] =
    useState<AccelerometerData | null>(null);

  const [location, setLocation] =
    useState<GPSData | null>(null);

  const [status, setStatus] = useState(
    "Monitoring Inactive"
  );

  const [emergency, setEmergency] =
    useState(false);

  const startMonitoring = useCallback(async () => {
    console.log("Requesting motion permission...");

    const permissionGranted =
      await SensorService.requestPermission();

    if (!permissionGranted) {
      setStatus("Motion Permission Denied");
      return;
    }

    console.log("Permission granted.");

    const started = await MonitoringService.start(
      () => {
        console.log("Emergency detected.");

        setEmergency(true);
        setStatus("Emergency Detected");
      },

      (sensorData) => {
        console.log("Sensor:", sensorData);
        setSensor(sensorData);
      },

      (gpsData) => {
        console.log("GPS:", gpsData);
        setLocation(gpsData);
      }
    );

    if (started) {
      setIsMonitoring(true);
      setStatus("Monitoring Active");
    } else {
      setStatus("Failed to Start");
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    MonitoringService.stop();

    setIsMonitoring(false);
    setEmergency(false);
    setStatus("Monitoring Inactive");

    setSensor(null);
    setLocation(null);
  }, []);

  return {
    isMonitoring,
    status,
    emergency,

    sensor,
    location,

    x: sensor?.x ?? null,
    y: sensor?.y ?? null,
    z: sensor?.z ?? null,
    magnitude: sensor?.magnitude ?? null,

    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    accuracy: location?.accuracy ?? null,

    startMonitoring,
    stopMonitoring,
  };
}