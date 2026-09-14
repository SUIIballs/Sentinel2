import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Header from "../components/Header/Header";
import SensorCard from "../components/Sensor/SensorCard";
import StatusCard from "../components/Status/StatusCard";
import EmergencyCard from "../components/Emergency/EmergencyCard";
import EmergencyAlert from "../components/Emergency/EmergencyAlert";
import EmergencyCountdown from "../components/Emergency/EmergencyCountdown";
import EmergencyAlertStatus from "../components/Emergency/EmergencyAlertStatus";

import useMonitoring from "../hooks/useMonitoring";
import EmergencyService from "../services/EmergencyService";
import EmergencyAlertService from "../services/EmergencyAlertService";
import NotificationService from "../services/NotificationService";

interface HomePageProps {
  onOpenMenu: () => void;
}

function HomePage({
  onOpenMenu,
}: HomePageProps) {
  const {
    isMonitoring,
    startMonitoring,
    stopMonitoring,

    fallDetected,
    emergency,
    confirmEmergency,
    cancelFallAlert,

    sensor,
    location,
  } = useMonitoring();

  // ==========================================
  // COUNTDOWN STATE
  // ==========================================

  const [
    countdownActive,
    setCountdownActive,
  ] = useState(false);

  const [
    countdownSeconds,
    setCountdownSeconds,
  ] = useState(10);

  // ==========================================
  // NOTIFICATION STATE
  // ==========================================

  const [
    notificationSent,
    setNotificationSent,
  ] = useState(false);

  // ==========================================
  // REAL FALL DETECTION
  // ==========================================

  useEffect(() => {
    /*
     * A countdown can only start when
     * monitoring is actually active.
     */
    if (
      !isMonitoring ||
      !fallDetected ||
      emergency ||
      countdownActive ||
      EmergencyService.isRunning()
    ) {
      return;
    }

    console.log(
      "⚠️ Fall detected."
    );

    console.log(
      "Starting emergency countdown..."
    );

    EmergencyService.startCountdown(
      (seconds) => {
        console.log(
          "Countdown:",
          seconds
        );

        setCountdownSeconds(
          seconds
        );

        setCountdownActive(
          true
        );
      },
      () => {
        console.log(
          "🚨 Emergency countdown finished."
        );

        setCountdownActive(
          false
        );

        setCountdownSeconds(
          10
        );

        /*
         * EmergencyService has already:
         *
         * 1. Retrieved GPS
         * 2. Saved history
         * 3. Called EmergencyAlertService
         * 4. Waited for backend response
         */
        confirmEmergency();
      },
      10
    );
  }, [
    isMonitoring,
    fallDetected,
    emergency,
    countdownActive,
    confirmEmergency,
  ]);

  // ==========================================
  // EMERGENCY NOTIFICATION
  // ==========================================

  useEffect(() => {
    if (!emergency) {
      return;
    }

    console.log(
      "🚨 Emergency state detected."
    );

    const sendNotification =
      async () => {
        const sent =
          await NotificationService.sendEmergencyNotification(
            location
          );

        setNotificationSent(
          sent
        );

        console.log(
          "Browser notification result:",
          sent
        );
      };

    void sendNotification();
  }, [
    emergency,
    location,
  ]);

  // ==========================================
  // CANCEL EMERGENCY
  // ==========================================

  const handleEmergencyCancel =
    useCallback(() => {
      console.log(
        "🟢 User selected I'm Safe."
      );

      EmergencyService.cancel();

      cancelFallAlert();

      EmergencyAlertService.resetDebug();

      setCountdownActive(
        false
      );

      setCountdownSeconds(
        10
      );

      setNotificationSent(
        false
      );
    }, [
      cancelFallAlert,
    ]);

  // ==========================================
  // SIMULATE FALL
  // ==========================================

  const handleSimulateFall =
    useCallback(async () => {
      /*
       * Don't allow another simulation
       * while an emergency is active.
       */
      if (
        countdownActive ||
        EmergencyService.isRunning() ||
        emergency
      ) {
        console.log(
          "Simulation blocked."
        );

        return;
      }

      console.log(
        "🧪 Simulating fall..."
      );

      EmergencyAlertService.resetDebug();

      setNotificationSent(
        false
      );

      /*
       * Request notification permission.
       */
      const notificationGranted =
        await NotificationService.requestPermission();

      if (!notificationGranted) {
        console.warn(
          "⚠️ Browser notification permission was not granted."
        );
      }

      /*
       * Start emergency countdown.
       */
      EmergencyService.startCountdown(
        (seconds) => {
          console.log(
            "🧪 Simulation countdown:",
            seconds
          );

          setCountdownSeconds(
            seconds
          );

          setCountdownActive(
            true
          );
        },
        () => {
          console.log(
            "🚨 Simulated emergency confirmed."
          );

          setCountdownActive(
            false
          );

          setCountdownSeconds(
            10
          );

          confirmEmergency();
        },
        10
      );
    }, [
      countdownActive,
      emergency,
      confirmEmergency,
    ]);

  // ==========================================
  // START MONITORING
  // ==========================================

  const handleStartMonitoring =
    useCallback(async () => {
      console.log(
        "▶ Starting monitoring..."
      );

      EmergencyService.reset();

      EmergencyAlertService.resetDebug();

      setCountdownActive(
        false
      );

      setCountdownSeconds(
        10
      );

      setNotificationSent(
        false
      );

      /*
       * Request browser notification
       * permission.
       */
      await NotificationService.requestPermission();

      /*
       * Start sensors + GPS.
       */
      await startMonitoring();
    }, [
      startMonitoring,
    ]);

  // ==========================================
  // STOP MONITORING
  // ==========================================

  const handleStopMonitoring =
    useCallback(() => {
      console.log(
        "🛑 Stopping monitoring..."
      );

      EmergencyService.reset();

      EmergencyAlertService.resetDebug();

      setCountdownActive(
        false
      );

      setCountdownSeconds(
        10
      );

      setNotificationSent(
        false
      );

      stopMonitoring();

      console.log(
        "✅ Monitoring stopped."
      );
    }, [
      stopMonitoring,
    ]);

  // ==========================================
  // SYSTEM STATUS COLOR
  // ==========================================

  const getStatusColor =
    (): "green" | "yellow" | "red" => {
      if (emergency) {
        return "red";
      }

      if (
        fallDetected ||
        countdownActive
      ) {
        return "yellow";
      }

      return "green";
    };

  // ==========================================
  // SYSTEM STATUS TEXT
  // ==========================================

  const getStatusText = () => {
    if (emergency) {
      return "Emergency Detected";
    }

    if (
      fallDetected ||
      countdownActive
    ) {
      return "Possible Fall Detected";
    }

    if (isMonitoring) {
      return "Monitoring Active";
    }

    return "System Ready";
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="app">

      {/* ===================================== */}
      {/* HEADER                                */}
      {/* ===================================== */}

      <Header
        onOpenMenu={
          onOpenMenu
        }
      />

      {/* ===================================== */}
      {/* EMERGENCY ALERT OVERLAY               */}
      {/* ===================================== */}

      <EmergencyAlert
        emergency={
          emergency
        }
        latitude={
          location?.latitude ?? null
        }
        longitude={
          location?.longitude ?? null
        }
        onCancel={
          handleEmergencyCancel
        }
      />

      <main className="main-content">

        {/* =================================== */}
        {/* MOTION MONITORING                   */}
        {/* =================================== */}

        <SensorCard
          x={
            sensor?.acceleration.x ??
            null
          }
          y={
            sensor?.acceleration.y ??
            null
          }
          z={
            sensor?.acceleration.z ??
            null
          }
          magnitude={
            sensor?.acceleration.magnitude ??
            null
          }
          alpha={
            sensor?.gyroscope.alpha ??
            null
          }
          beta={
            sensor?.gyroscope.beta ??
            null
          }
          gamma={
            sensor?.gyroscope.gamma ??
            null
          }
          status={
            isMonitoring
              ? "Monitoring Active"
              : "Monitoring Inactive"
          }
          buttonText={
            isMonitoring
              ? "Stop Monitoring"
              : "Start Monitoring"
          }
          onRequestPermission={
            isMonitoring
              ? handleStopMonitoring
              : handleStartMonitoring
          }
        />

        {/* =================================== */}
        {/* SYSTEM STATUS                       */}
        {/* =================================== */}

        <StatusCard
          title="System Status"
          status={
            getStatusText()
          }
          color={
            getStatusColor()
          }
        />

        {/* =================================== */}
        {/* EMERGENCY STATUS                    */}
        {/* =================================== */}

        <EmergencyCard
          emergency={
            emergency
          }
        />

        {/* =================================== */}
        {/* EMERGENCY ALERT STATUS              */}
        {/* =================================== */}

        <EmergencyAlertStatus
          emergency={
            emergency
          }
          locationAvailable={
            location !== null
          }
          notificationSent={
            notificationSent
          }
        />

        {/* =================================== */}
        {/* EMERGENCY COUNTDOWN                  */}
        {/* =================================== */}

        <EmergencyCountdown
          active={
            countdownActive
          }
          seconds={
            countdownSeconds
          }
          onCancel={
            handleEmergencyCancel
          }
        />

        {/* =================================== */}
        {/* SIMULATE FALL                        */}
        {/* =================================== */}

        <button
          type="button"
          onClick={
            handleSimulateFall
          }
          disabled={
            countdownActive ||
            EmergencyService.isRunning() ||
            emergency
          }
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            cursor:
              countdownActive ||
              EmergencyService.isRunning() ||
              emergency
                ? "not-allowed"
                : "pointer",
          }}
        >
          🧪 Simulate Fall
        </button>

      </main>
    </div>
  );
}

export default HomePage;