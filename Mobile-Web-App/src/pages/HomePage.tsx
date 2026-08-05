import { useState } from "react";

import Header from "../components/Header/Header";
import SensorCard from "../components/Sensor/SensorCard";
import StatusCard from "../components/Status/StatusCard";
import EmergencyCard from "../components/Emergency/EmergencyCard";
import EmergencyCountdown from "../components/Emergency/EmergencyCountdown";

import useMonitoring from "../hooks/useMonitoring";
import EmergencyService from "../services/EmergencyService";

interface HomePageProps {
  onViewHistory: () => void;
}

const HomePage = ({
  onViewHistory,
}: HomePageProps) => {
  const {
    x,
    y,
    z,
    magnitude,
    status,
    emergency,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  } = useMonitoring();

  const [countdownActive, setCountdownActive] =
    useState(false);

  const [countdownSeconds, setCountdownSeconds] =
    useState(10);

  /**
   * Start Emergency Countdown
   */
  const triggerEmergency = () => {
    if (EmergencyService.isRunning()) {
      return;
    }

    setCountdownActive(true);

    EmergencyService.startCountdown(
      (seconds) => {
        setCountdownSeconds(seconds);
      },
      () => {
        setCountdownActive(false);

        console.log("Emergency confirmed.");
      }
    );
  };

  /**
   * Cancel Emergency
   */
  const cancelEmergency = () => {
    EmergencyService.cancel();

    setCountdownActive(false);
    setCountdownSeconds(10);

    console.log("Emergency cancelled.");
  };

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
        x={x}
        y={y}
        z={z}
        magnitude={magnitude}
        status={status}
        buttonText={
          isMonitoring
            ? "Stop Monitoring"
            : "Start Monitoring"
        }
        onRequestPermission={
          isMonitoring
            ? stopMonitoring
            : startMonitoring
        }
      />

      <EmergencyCountdown
        active={countdownActive}
        seconds={countdownSeconds}
        onCancel={cancelEmergency}
      />

      <EmergencyCard emergency={emergency} />

      {/* Simulate Fall */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <button
          onClick={triggerEmergency}
          style={{
            padding: "12px 20px",
            background: "#ff3b30",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Simulate Fall
        </button>
      </div>

      {/* View History */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "15px",
        }}
      >
        <button
          onClick={onViewHistory}
          style={{
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📜 View History
        </button>
      </div>
    </main>
  );
};

export default HomePage;