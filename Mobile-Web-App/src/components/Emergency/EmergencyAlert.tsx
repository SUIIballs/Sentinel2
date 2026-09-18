import {
  useEffect,
  useState,
} from "react";

import EmergencyAlertService from "../../services/EmergencyAlertService";

interface EmergencyAlertProps {
  emergency: boolean;
  latitude: number | null;
  longitude: number | null;
  onCancel: () => void;
}

const EmergencyAlert = ({
  emergency,
  latitude,
  longitude,
  onCancel,
}: EmergencyAlertProps) => {
  const [, setRefresh] =
    useState(0);

  /*
   * EmergencyAlertService processes
   * the backend request asynchronously.
   *
   * Refresh this component periodically
   * so the message changes when the
   * backend/contact processing finishes.
   */
  useEffect(() => {
    if (!emergency) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setRefresh(
          (value) => value + 1
        );
      }, 250);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [emergency]);

  if (!emergency) {
    return null;
  }

  const debug =
    EmergencyAlertService.getDebugState();

  const hasContactResults =
    debug.contactResults.length > 0;

  const failedContacts =
    debug.contactResults.filter(
      (result) =>
        !result.success
    );

  const processingComplete =
    hasContactResults &&
    debug.contactResults.length > 0 &&
    debug.contactResults.every(
      (result) =>
        result.success
    );

  const processingFailed =
    hasContactResults &&
    failedContacts.length > 0;

  let alertTitle =
    "Emergency alert processing...";

  let alertMessage =
    "Sentinel is processing the emergency alert.";

  let alertBackground =
    "#172554";

  if (processingComplete) {
    alertTitle =
      "Emergency alert processing completed.";

    alertMessage =
      "Backend alert and simulated SMS have been processed.";

    alertBackground =
      "#14532d";
  }

  if (processingFailed) {
    alertTitle =
      "Emergency alert processing failed.";

    alertMessage =
      "The emergency was detected and saved, but one or more backend alerts could not be processed.";

    alertBackground =
      "#450a0a";
  }

  /*
   * If GPS is unavailable, the backend
   * alert will not be attempted.
   */
  if (
    !latitude ||
    !longitude
  ) {
    if (
      debug.serviceCalled &&
      !debug.requestStarted
    ) {
      alertTitle =
        "Emergency detected.";

      alertMessage =
        "The emergency was detected and saved locally, but GPS location was unavailable.";

      alertBackground =
        "#451a03";
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform:
          "translateX(-50%)",
        width: "min(90%, 520px)",
        zIndex: 9999,
        background: "#1f2937",
        color: "white",
        border:
          "3px solid #dc2626",
        borderRadius: "14px",
        padding: "24px",
        boxSizing: "border-box",
        boxShadow:
          "0 10px 40px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            marginBottom: "8px",
          }}
        >
          🚨
        </div>

        <h2
          style={{
            margin: 0,
            color: "#f87171",
            fontSize: "26px",
          }}
        >
          EMERGENCY DETECTED
        </h2>

        <p
          style={{
            marginTop: "8px",
            marginBottom: 0,
          }}
        >
          A fall has been detected by
          Sentinel.
        </p>
      </div>

      <div
        style={{
          background: "#111827",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "18px",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
          }}
        >
          Emergency Information
        </h3>

        <p
          style={{
            margin: "6px 0",
          }}
        >
          <strong>Status:</strong>{" "}
          Emergency Confirmed
        </p>

        <p
          style={{
            margin: "6px 0",
          }}
        >
          <strong>Reason:</strong>{" "}
          Fall Detected
        </p>

        <p
          style={{
            margin: "6px 0",
          }}
        >
          <strong>GPS:</strong>{" "}
          {latitude !== null &&
          longitude !== null
            ? "Location Captured"
            : "Location Unavailable"}
        </p>

        {latitude !== null &&
          longitude !== null && (
            <>
              <p
                style={{
                  margin: "6px 0",
                  fontSize: "14px",
                }}
              >
                Latitude:{" "}
                {latitude.toFixed(6)}
              </p>

              <p
                style={{
                  margin: "6px 0",
                  fontSize: "14px",
                }}
              >
                Longitude:{" "}
                {longitude.toFixed(6)}
              </p>
            </>
          )}
      </div>

      {/* Dynamic alert processing status */}
      <div
        style={{
          background:
            alertBackground,
          borderRadius: "10px",
          padding: "12px",
          marginBottom: "18px",
          textAlign: "center",
        }}
      >
        <strong>
          {alertTitle}
        </strong>

        <p
          style={{
            margin: "6px 0 0",
            fontSize: "13px",
            opacity: 0.9,
          }}
        >
          {alertMessage}
        </p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        style={{
          width: "100%",
          padding: "14px",
          border: "none",
          borderRadius: "9px",
          background: "#16a34a",
          color: "white",
          fontSize: "17px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        I'm Safe
      </button>
    </div>
  );
};

export default EmergencyAlert;