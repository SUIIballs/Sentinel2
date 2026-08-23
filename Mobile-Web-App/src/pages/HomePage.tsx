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
    // Accelerometer
    x,
    y,
    z,
    magnitude,

    // Gyroscope
    alpha,
    beta,
    gamma,

    // Fall Detection Diagnostics
    fallStage,
    fallAcceleration,
    fallRotation,
    fallJerk,
    fallScore,
    candidateImpact,
    candidateImpactMagnitude,
    fallBufferSize,

    // Monitoring
    status,
    emergency,
    isMonitoring,

    // Controls
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

        console.log(
          "Emergency confirmed."
        );
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

    console.log(
      "Emergency cancelled."
    );
  };

  return (
    <main className="home-page">
      <Header />

      {/* ================================
          SYSTEM STATUS
      ================================= */}

      <StatusCard
        title="System Status"
        status={
          isMonitoring
            ? "Monitoring Active"
            : "Monitoring Inactive"
        }
        color={
          isMonitoring
            ? "green"
            : "red"
        }
      />

      {/* ================================
          MOTION SENSOR
      ================================= */}

      <SensorCard
        x={x}
        y={y}
        z={z}
        magnitude={magnitude}
        alpha={alpha}
        beta={beta}
        gamma={gamma}
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

      {/* ================================
          FALL DETECTION DIAGNOSTICS
      ================================= */}

      <section
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "16px",
          background: "#1e293b",
          color: "white",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "18px",
          }}
        >
          Fall Detection Diagnostics
        </h2>

        {/* Stage */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom:
              "1px solid #334155",
          }}
        >
          <strong>Stage</strong>

          <span>
            {fallStage}
          </span>
        </div>

        {/* Acceleration */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom:
              "1px solid #334155",
          }}
        >
          <strong>
            Acceleration
          </strong>

          <span>
            {fallAcceleration.toFixed(2)} m/s²
          </span>
        </div>

        {/* Rotation */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom:
              "1px solid #334155",
          }}
        >
          <strong>
            Rotation
          </strong>

          <span>
            {fallRotation.toFixed(2)} °/s
          </span>
        </div>

        {/* Jerk */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom:
              "1px solid #334155",
          }}
        >
          <strong>
            Jerk
          </strong>

          <span>
            {fallJerk.toFixed(2)} m/s³
          </span>
        </div>

        {/* Fall Score */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom:
              "1px solid #334155",
          }}
        >
          <strong>
            Fall Score
          </strong>

          <span>
            {fallScore.toFixed(3)}
          </span>
        </div>

        {/* Candidate Impact */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom:
              "1px solid #334155",
          }}
        >
          <strong>
            Candidate Impact
          </strong>

          <span>
            {candidateImpact
              ? "YES"
              : "NO"}
          </span>
        </div>

        {/* Impact Magnitude */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom:
              "1px solid #334155",
          }}
        >
          <strong>
            Impact Magnitude
          </strong>

          <span>
            {candidateImpactMagnitude.toFixed(
              2
            )}{" "}
            m/s²
          </span>
        </div>

        {/* Buffer */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
          }}
        >
          <strong>
            Buffer Samples
          </strong>

          <span>
            {fallBufferSize}
          </span>
        </div>
      </section>

      {/* ================================
          EMERGENCY COUNTDOWN
      ================================= */}

      <EmergencyCountdown
        active={countdownActive}
        seconds={countdownSeconds}
        onCancel={cancelEmergency}
      />

      {/* ================================
          EMERGENCY STATUS
      ================================= */}

      <EmergencyCard
        emergency={emergency}
      />

      {/* ================================
          SIMULATE FALL
      ================================= */}

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

      {/* ================================
          VIEW HISTORY
      ================================= */}

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
          View History
        </button>
      </div>
    </main>
  );
};

export default HomePage;