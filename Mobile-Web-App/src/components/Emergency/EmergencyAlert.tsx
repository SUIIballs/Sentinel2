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
  if (!emergency) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(90%, 520px)",
        zIndex: 9999,
        background: "#1f2937",
        color: "white",
        border: "3px solid #dc2626",
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
          A fall has been detected by Sentinel.
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

        <p style={{ margin: "6px 0" }}>
          <strong>Status:</strong>{" "}
          Emergency Confirmed
        </p>

        <p style={{ margin: "6px 0" }}>
          <strong>Reason:</strong>{" "}
          Fall Detected
        </p>

        <p style={{ margin: "6px 0" }}>
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

      <div
        style={{
          background: "#172554",
          borderRadius: "10px",
          padding: "12px",
          marginBottom: "18px",
          textAlign: "center",
        }}
      >
        <strong>
          Emergency alert processing completed.
        </strong>

        <p
          style={{
            margin: "6px 0 0",
            fontSize: "13px",
            opacity: 0.85,
          }}
        >
          Backend alert and simulated SMS have been
          processed.
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