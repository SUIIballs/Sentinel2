import { useCallback, useState } from "react";

import MonitoringService from "../services/MonitoringService";
import SensorService from "../services/SensorService";
import FallDetectionService from "../services/FallDetectionService";
import EmergencyService from "../services/EmergencyService";

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

  const [status, setStatus] = useState(
    "Monitoring Inactive"
  );

  // ==========================================
  // EMERGENCY STATE
  // ==========================================

  const [fallDetected, setFallDetected] =
    useState(false);

  const [emergency, setEmergency] =
    useState(false);

  // ==========================================
  // SENSOR DATA
  // ==========================================

  const [sensor, setSensor] =
    useState<MotionSensorData | null>(null);

  // ==========================================
  // GPS DATA
  // ==========================================

  const [location, setLocation] =
    useState<GPSData | null>(null);

  // ==========================================
  // FALL DIAGNOSTICS
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
        "▶ Starting monitoring..."
      );

      /*
       * IMPORTANT:
       * Completely reset any previous emergency
       * state before starting a new monitoring
       * session.
       */
      EmergencyService.reset();

      MonitoringService.reset();

      FallDetectionService.reset();

      setFallDetected(false);
      setEmergency(false);

      setSensor(null);
      setLocation(null);

      setFallDiagnostics(
        FallDetectionService.getDiagnostics()
      );

      setStatus(
        "Starting Monitoring..."
      );

      // ========================================
      // REQUEST MOTION PERMISSION
      // ========================================

      console.log(
        "Requesting motion permission..."
      );

      const permissionGranted =
        await SensorService.requestPermission();

      if (!permissionGranted) {
        console.warn(
          "❌ Motion permission denied."
        );

        setIsMonitoring(false);

        setFallDetected(false);
        setEmergency(false);

        setStatus(
          "Motion Permission Denied"
        );

        return;
      }

      console.log(
        "✅ Motion permission granted."
      );

      // ========================================
      // START MONITORING SERVICE
      // ========================================

      const started =
        await MonitoringService.start(
          // ====================================
          // FALL CALLBACK
          // ====================================

          () => {
            console.log(
              "⚠️ Possible fall detected."
            );

            /*
             * Do NOT immediately set emergency.
             *
             * HomePage will start the
             * 10-second emergency countdown.
             */
            setFallDetected(true);

            setStatus(
              "Possible Fall Detected"
            );
          },

          // ====================================
          // SENSOR CALLBACK
          // ====================================

          (sensorData: MotionSensorData) => {
            setSensor(
              sensorData
            );

            const diagnostics =
              FallDetectionService.getDiagnostics();

            setFallDiagnostics(
              diagnostics
            );
          },

          // ====================================
          // GPS CALLBACK
          // ====================================

          (gpsData: GPSData) => {
            setLocation(
              gpsData
            );
          }
        );

      // ========================================
      // START RESULT
      // ========================================

      if (started) {
        console.log(
          "✅ Monitoring active."
        );

        setIsMonitoring(true);

        /*
         * Make sure a clean monitoring
         * session starts without an old
         * emergency.
         */
        setFallDetected(false);
        setEmergency(false);

        setStatus(
          "Monitoring Active"
        );

        return;
      }

      // ========================================
      // MONITORING FAILED
      // ========================================

      console.warn(
        "❌ Monitoring failed to start."
      );

      EmergencyService.reset();

      MonitoringService.stop();

      FallDetectionService.reset();

      setIsMonitoring(false);

      setFallDetected(false);
      setEmergency(false);

      setSensor(null);
      setLocation(null);

      setFallDiagnostics(
        FallDetectionService.getDiagnostics()
      );

      setStatus(
        "Failed to Start"
      );
    },
    []
  );

  // ==========================================
  // CONFIRM EMERGENCY
  // ==========================================

  const confirmEmergency = useCallback(
    () => {
      /*
       * Emergency confirmation should only
       * happen while monitoring is active.
       */
      if (!MonitoringService.running) {
        console.warn(
          "⚠️ Emergency confirmation ignored because monitoring is inactive."
        );

        return;
      }

      console.log(
        "🚨 Emergency confirmed."
      );

      setFallDetected(false);

      setEmergency(true);

      setStatus(
        "Emergency Detected"
      );
    },
    []
  );

  // ==========================================
  // CANCEL FALL / EMERGENCY
  // ==========================================

  const cancelFallAlert = useCallback(
    () => {
      console.log(
        "🟢 Fall alert cancelled."
      );

      /*
       * Stop any emergency countdown.
       */
      EmergencyService.cancel();

      setFallDetected(false);

      setEmergency(false);

      setStatus(
        isMonitoring
          ? "Monitoring Active"
          : "Monitoring Inactive"
      );
    },
    [isMonitoring]
  );

  // ==========================================
  // CLEAR EMERGENCY
  // ==========================================

  const clearEmergency = useCallback(
    () => {
      console.log(
        "Clearing emergency state."
      );

      /*
       * Make sure no countdown remains
       * active.
       */
      EmergencyService.reset();

      setEmergency(false);

      setFallDetected(false);

      setStatus(
        isMonitoring
          ? "Monitoring Active"
          : "Monitoring Inactive"
      );
    },
    [isMonitoring]
  );

  // ==========================================
  // STOP MONITORING
  // ==========================================

  const stopMonitoring = useCallback(
    () => {
      console.log(
        "🛑 Stopping monitoring..."
      );

      /*
       * IMPORTANT:
       * Stop emergency countdown FIRST.
       */
      EmergencyService.reset();

      /*
       * Stop sensor/GPS monitoring.
       */
      MonitoringService.stop();

      /*
       * Reset fall detection.
       */
      FallDetectionService.reset();

      // ========================================
      // RESET REACT STATE
      // ========================================

      setIsMonitoring(false);

      setFallDetected(false);

      setEmergency(false);

      setStatus(
        "Monitoring Inactive"
      );

      setSensor(null);

      setLocation(null);

      setFallDiagnostics(
        FallDetectionService.getDiagnostics()
      );

      console.log(
        "✅ Monitoring stopped."
      );
    },
    []
  );

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // ----------------------------------------
    // Monitoring
    // ----------------------------------------

    isMonitoring,

    status,

    // ----------------------------------------
    // Fall / Emergency
    // ----------------------------------------

    fallDetected,

    emergency,

    // ----------------------------------------
    // Raw sensor data
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
    // Fall Diagnostics
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

    lastEventMaxJerk:
      fallDiagnostics.lastEventMaxJerk ??
      0,

    // ----------------------------------------
    // Controls
    // ----------------------------------------

    startMonitoring,

    stopMonitoring,

    confirmEmergency,

    cancelFallAlert,

    clearEmergency,
  };
}