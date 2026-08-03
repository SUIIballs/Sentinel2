import { useCallback, useState } from "react";

import MonitoringService from "../services/MonitoringService";

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
    const started =
      await MonitoringService.start(
        () => {
          setEmergency(true);
          setStatus("Emergency Detected");
        },

        (sensorData) => {
          setSensor(sensorData);
        },

        (gpsData) => {
          setLocation(gpsData);
        }
      );

    if (started) {
      setIsMonitoring(true);
      setStatus("Monitoring Active");
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

    emergency,

    status,

    sensor,

    location,

    startMonitoring,

    stopMonitoring,
  };
}