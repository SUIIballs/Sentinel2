import { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import SensorCard from "../components/Sensor/SensorCard";
import StatusCard from "../components/Status/StatusCard";
import EmergencyCard from "../components/Emergency/EmergencyCard";
import EmergencyCountdown from "../components/Emergency/EmergencyCountdown";

import MonitoringService from "../services/MonitoringService";

/**
 * HomePage
 *
 * Main dashboard of the Sentinel application.
 */
const HomePage = () => {
  // Device orientation values
  const [alpha, setAlpha] = useState<number | null>(null);
  const [beta, setBeta] = useState<number | null>(null);
  const [gamma, setGamma] = useState<number | null>(null);

  // Sensor status
  const [status, setStatus] = useState("Waiting for permission...");

  // Monitoring state
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Emergency state
  const [emergency, setEmergency] = useState(false);

  // Countdown state
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);

  /**
   * Countdown Timer
   */
  useEffect(() => {
    if (!countdownActive) return;

    const timer = window.setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);

          setCountdownActive(false);
          setEmergency(true);
          setStatus("Emergency Confirmed!");

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdownActive]);

  /**
   * Cancel Emergency
   */
  const cancelEmergency = () => {
    setCountdownActive(false);
    setCountdownSeconds(10);
    setStatus("Monitoring resumed.");
  };

  /**
   * Trigger countdown when a fall is detected
   */
  const startEmergencyCountdown = () => {
    setCountdownSeconds(10);
    setCountdownActive(true);
  };

  /**
   * Request sensor permission
   */
  const requestPermission = async () => {
    console.log("===== SENSOR DEBUG =====");
    console.log("Protocol:", window.location.protocol);
    console.log("Host:", window.location.host);
    console.log("Secure Context:", window.isSecureContext);
    console.log(
      "DeviceOrientationEvent:",
      typeof window.DeviceOrientationEvent
    );
    console.log(
      "DeviceMotionEvent:",
      typeof window.DeviceMotionEvent
    );

    setStatus(
      `Secure: ${window.isSecureContext} | Orientation: ${
        typeof window.DeviceOrientationEvent
      }`
    );

    if (!window.DeviceOrientationEvent) {
      setStatus("Device Orientation not supported.");
      return;
    }

    const handleOrientation = (
      event: DeviceOrientationEvent
    ) => {
      console.log("Orientation Event:", event);

      setAlpha(event.alpha ?? null);
      setBeta(event.beta ?? null);
      setGamma(event.gamma ?? null);

      setStatus("Reading sensor...");
    };

    const deviceOrientation =
      DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<
          "granted" | "denied"
        >;
      };

    if (
      typeof deviceOrientation.requestPermission ===
      "function"
    ) {
      try {
        const permission =
          await deviceOrientation.requestPermission();

        console.log("Permission:", permission);

        if (permission === "granted") {
          window.addEventListener(
            "deviceorientation",
            handleOrientation
          );

          MonitoringService.start(
            startEmergencyCountdown
          );

          setIsMonitoring(true);
          setStatus("Monitoring Active");
        } else {
          setStatus("Permission denied.");
        }
      } catch (error) {
        console.error(error);
        setStatus("Permission request failed.");
      }
    } else {
      console.log("No explicit permission required.");

      window.addEventListener(
        "deviceorientation",
        handleOrientation
      );

      MonitoringService.start(startEmergencyCountdown);

      setIsMonitoring(true);
      setStatus("Monitoring Active");
    }
  };

  /**
   * Stop Monitoring
   */
  const stopMonitoring = () => {
    MonitoringService.stop();

    setIsMonitoring(false);
    setCountdownActive(false);
    setCountdownSeconds(10);
    setEmergency(false);

    setStatus("Monitoring stopped.");
  };

  /**
   * Device Position
   */
  let devicePosition = "Unknown";

  if (beta !== null && gamma !== null) {
    if (
      Math.abs(beta) < 15 &&
      Math.abs(gamma) < 15
    ) {
      devicePosition = "📱 Flat";
    } else if (beta > 15) {
      devicePosition = "📱 Tilted Forward";
    } else if (beta < -15) {
      devicePosition = "📱 Tilted Backward";
    } else if (gamma > 15) {
      devicePosition = "📱 Tilted Right";
    } else if (gamma < -15) {
      devicePosition = "📱 Tilted Left";
    }
  }

  return (
    <main className="home-page">
      <Header />

      <StatusCard
        title="System Status"
        status={
          isMonitoring
            ? "Monitoring Active"
            : "Monitoring Inactive"
        }
        color={isMonitoring ? "green" : "red"}
      />

   <SensorCard
  alpha={alpha}
  beta={beta}
  gamma={gamma}
  status={status}
  devicePosition={devicePosition}
  onRequestPermission={
    isMonitoring
      ? stopMonitoring
      : requestPermission
  }
/>

      <EmergencyCountdown
        active={countdownActive}
        seconds={countdownSeconds}
        onCancel={cancelEmergency}
      />

      <EmergencyCard emergency={emergency} />
    </main>
  );
};

export default HomePage;