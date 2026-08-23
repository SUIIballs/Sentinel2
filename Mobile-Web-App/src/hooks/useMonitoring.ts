import { useCallback, useState } from "react";

import MonitoringService from "../services/MonitoringService";
import SensorService from "../services/SensorService";
import FallDetectionService from "../services/FallDetectionService";

import type {
  MotionSensorData,
  GPSData,
} from "../types/sensor";

export default function useMonitoring() {
  // ==========================================
  // MONITORING STATE
  // ==========================================

  const [isMonitoring, setIsMonitoring] =
    useState(false);

  const [sensor, setSensor] =
    useState<MotionSensorData | null>(null);

  const [location, setLocation] =
    useState<GPSData | null>(null);

  const [status, setStatus] = useState(
    "Monitoring Inactive"
  );

  const [emergency, setEmergency] =
    useState(false);

  // ==========================================
  // FALL DETECTION DIAGNOSTICS
  // ==========================================

  const [fallDiagnostics, setFallDiagnostics] =
    useState(
      FallDetectionService.getDiagnostics()
    );

  // ==========================================
  // START MONITORING
  // ==========================================

  const startMonitoring = useCallback(
    async () => {
      console.log(
        "Requesting motion permission..."
      );

      const permissionGranted =
        await SensorService.requestPermission();

      if (!permissionGranted) {
        setStatus(
          "Motion Permission Denied"
        );

        return;
      }

      console.log(
        "Permission granted."
      );

      const started =
        await MonitoringService.start(
          // ====================================
          // EMERGENCY CALLBACK
          // ====================================

          () => {
            console.log(
              "Emergency detected."
            );

            setEmergency(true);

            setStatus(
              "Emergency Detected"
            );
          },

          // ====================================
          // SENSOR CALLBACK
          // ====================================

          (sensorData) => {
            console.log(
              "Motion Sensor:",
              sensorData
            );

            setSensor(sensorData);

            // Get latest fall detection state
            const diagnostics =
              FallDetectionService.getDiagnostics();

            setFallDiagnostics(
              diagnostics
            );

            console.log(
              "Fall Detection Diagnostics:",
              diagnostics
            );
          },

          // ====================================
          // GPS CALLBACK
          // ====================================

          (gpsData) => {
            console.log(
              "GPS:",
              gpsData
            );

            setLocation(gpsData);
          }
        );

      if (started) {
        setIsMonitoring(true);

        setStatus(
          "Monitoring Active"
        );
      } else {
        setStatus(
          "Failed to Start"
        );
      }
    },
    []
  );

  // ==========================================
  // STOP MONITORING
  // ==========================================

  const stopMonitoring = useCallback(
    () => {
      MonitoringService.stop();

      FallDetectionService.reset();

      setIsMonitoring(false);

      setEmergency(false);

      setStatus(
        "Monitoring Inactive"
      );

      setSensor(null);

      setLocation(null);

      // Get the actual reset state
      // directly from FallDetectionService
      setFallDiagnostics(
        FallDetectionService.getDiagnostics()
      );
    },
    []
  );

  // ==========================================
  // RETURN DATA TO UI
  // ==========================================

  return {
    // ----------------------------------------
    // Monitoring
    // ----------------------------------------

    isMonitoring,
    status,
    emergency,

    // ----------------------------------------
    // Raw data
    // ----------------------------------------

    sensor,
    location,

    // ----------------------------------------
    // Accelerometer
    // ----------------------------------------

    x:
      sensor?.acceleration.x ??
      null,

    y:
      sensor?.acceleration.y ??
      null,

    z:
      sensor?.acceleration.z ??
      null,

    magnitude:
      sensor?.acceleration.magnitude ??
      null,

    // ----------------------------------------
    // Gyroscope
    // ----------------------------------------

    alpha:
      sensor?.gyroscope.alpha ??
      null,

    beta:
      sensor?.gyroscope.beta ??
      null,

    gamma:
      sensor?.gyroscope.gamma ??
      null,

    // ----------------------------------------
    // GPS
    // ----------------------------------------

    latitude:
      location?.latitude ??
      null,

    longitude:
      location?.longitude ??
      null,

    accuracy:
      location?.accuracy ??
      null,

    // ----------------------------------------
    // NEW FALL DETECTION DIAGNOSTICS
    // ----------------------------------------

    fallStage:
      fallDiagnostics.stage,

    fallAcceleration:
      fallDiagnostics.acceleration,

    fallRotation:
      fallDiagnostics.rotation,

    fallJerk:
      fallDiagnostics.jerk,

    fallScore:
      fallDiagnostics.fallScore,

    candidateImpact:
      fallDiagnostics.candidateImpact,

    candidateImpactMagnitude:
      fallDiagnostics.candidateImpactMagnitude,

    fallBufferSize:
      fallDiagnostics.bufferSize,

    // ----------------------------------------
    // Controls
    // ----------------------------------------

    startMonitoring,
    stopMonitoring,
  };
}