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

      {/* Overall emergency status */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        <div>
          {getStatusIcon(
            locationAvailable
          )}{" "}
          GPS Location Captured
        </div>

        <div>
          {getStatusIcon(
            emergency
          )}{" "}
          Emergency Incident Saved
        </div>

        <div>
          {getStatusIcon(
            notificationSent
          )}{" "}
          Browser Notification Triggered
        </div>
      </div>

      {/* Backend overall status */}
      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          borderRadius: "8px",
          background: "#1f2937",
        }}
      >
        <div>
          {getStatusIcon(
            debug.backendSuccess
          )}{" "}
          Backend Alerts Processed
        </div>

        <div
          style={{
            marginTop: "8px",
          }}
        >
          {getStatusIcon(
            debug.smsSent
          )}{" "}
          SMS Alerts Simulated
        </div>

        {debug.httpStatus !== null && (
          <p
            style={{
              margin:
                "10px 0 0",
              fontSize: "14px",
            }}
          >
            <strong>
              Last Backend HTTP Status:
            </strong>{" "}
            {debug.httpStatus}
          </p>
        )}
      </div>

      {/* Per-contact results */}
      {debug.contactResults.length >
        0 && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <h3
            style={{
              marginBottom: "12px",
            }}
          >
            Emergency Contacts
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {debug.contactResults.map(
              (result) => (
                <div
                  key={
                    result.contactId
                  }
                  style={{
                    padding: "12px",
                    borderRadius:
                      "8px",
                    background:
                      result.success
                        ? "#14532d"
                        : "#450a0a",
                    border:
                      result.success
                        ? "1px solid #22c55e"
                        : "1px solid #dc2626",
                  }}
                >
                  <div
                    style={{
                      fontWeight:
                        "bold",
                    }}
                  >
                    {getStatusIcon(
                      result.success
                    )}{" "}
                    {result.contactName}
                  </div>

                  <div
                    style={{
                      marginTop:
                        "5px",
                      fontSize:
                        "14px",
                      opacity: 0.9,
                    }}
                  >
                    {result.phone}
                  </div>

                  <div
                    style={{
                      marginTop:
                        "5px",
                      fontSize:
                        "14px",
                    }}
                  >
                    {result.success
                      ? "Emergency alert processed"
                      : "Emergency alert failed"}
                  </div>

                  {result.httpStatus !==
                    null && (
                    <div
                      style={{
                        marginTop:
                          "4px",
                        fontSize:
                          "13px",
                        opacity: 0.8,
                      }}
                    >
                      HTTP Status:{" "}
                      {
                        result.httpStatus
                      }
                    </div>
                  )}

                  {result.smsSent && (
                    <div
                      style={{
                        marginTop:
                          "4px",
                        fontSize:
                          "13px",
                      }}
                    >
                      ✓ Mock SMS
                      processed
                    </div>
                  )}

                  {result.error && (
                    <div
                      style={{
                        marginTop:
                          "6px",
                        fontSize:
                          "13px",
                        color:
                          "#fca5a5",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      Error:{" "}
                      {result.error}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Alert type */}
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
      </div>

      {/* General error */}
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
        SMS alerts are simulated for
        the current prototype.
      </p>
    </section>
  );
};

export default EmergencyAlertStatus;