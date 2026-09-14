import EmergencyAlertService from "../../services/EmergencyAlertService";

interface EmergencyAlertStatusProps {
  emergency: boolean;
  locationAvailable: boolean;
  notificationSent: boolean;
}

const EmergencyAlertStatus = ({
  emergency,
  locationAvailable,
  notificationSent,
}: EmergencyAlertStatusProps) => {
  if (!emergency) {
    return null;
  }

  const debug =
    EmergencyAlertService.getDebugState();

  const getStatusIcon = (
    success: boolean
  ) => {
    return success ? "✓" : "✗";
  };

  return (
    <section
      className="diagnostics-card"
      style={{
        marginTop: "20px",
        border: "1px solid #dc2626",
      }}
    >
      <h2>
        Emergency Alert Status
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        {/* GPS */}
        <div>
          {getStatusIcon(
            locationAvailable
          )}{" "}
          GPS Location Captured
        </div>

        {/* History */}
        <div>
          {getStatusIcon(
            emergency
          )}{" "}
          Emergency Incident Saved
        </div>

        {/* Browser Notification */}
        <div>
          {getStatusIcon(
            notificationSent
          )}{" "}
          Browser Notification Triggered
        </div>

        {/* Backend */}
        <div>
          {getStatusIcon(
            debug.backendSuccess
          )}{" "}
          Backend Alert Received
        </div>

        {/* SMS */}
        <div>
          {getStatusIcon(
            debug.smsSent
          )}{" "}
          SMS Alert Simulated
        </div>
      </div>

      {/* Backend details */}
      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          borderRadius: "8px",
          background: "#1f2937",
        }}
      >
        <strong>
          Alert Type:
        </strong>{" "}
        Fall Detected

        {debug.httpStatus !== null && (
          <p
            style={{
              margin:
                "8px 0 0",
              fontSize: "14px",
            }}
          >
            <strong>
              Backend HTTP Status:
            </strong>{" "}
            {debug.httpStatus}
          </p>
        )}
      </div>

      {/* Error */}
      {debug.error && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "8px",
            background: "#450a0a",
            color: "#fca5a5",
            fontSize: "14px",
            wordBreak:
              "break-word",
          }}
        >
          <strong>
            Alert Error:
          </strong>{" "}
          {debug.error}
        </div>
      )}

      <p
        style={{
          marginTop: "15px",
          fontSize: "14px",
          opacity: 0.8,
        }}
      >
        SMS delivery is simulated for
        the current prototype.
      </p>
    </section>
  );
};

export default EmergencyAlertStatus;