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

  const hasContactResults =
    debug.contactResults.length > 0;

  const failedContacts =
    debug.contactResults.filter(
      (result) =>
        !result.success
    );

  const allContactsSuccessful =
    hasContactResults &&
    failedContacts.length === 0;

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

      {/* GPS warning */}
      {!locationAvailable && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            borderRadius: "8px",
            background: "#451a03",
            border:
              "1px solid #f59e0b",
            color: "#fcd34d",
          }}
        >
          <strong>
            ⚠ GPS Location Unavailable
          </strong>

          <p
            style={{
              margin:
                "6px 0 0",
              fontSize: "14px",
            }}
          >
            The emergency incident
            was saved locally, but
            the alert could not
            include a GPS location.
          </p>
        </div>
      )}

      {/* Browser notification warning */}
      {!notificationSent && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            borderRadius: "8px",
            background: "#451a03",
            border:
              "1px solid #f59e0b",
            color: "#fcd34d",
          }}
        >
          <strong>
            ⚠ Browser Notification
            Not Triggered
          </strong>

          <p
            style={{
              margin:
                "6px 0 0",
              fontSize: "14px",
            }}
          >
            The emergency backend
            processing can still
            succeed even if browser
            notifications are
            unavailable.
          </p>
        </div>
      )}

      {/* Backend status */}
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

      {/* Backend failure */}
      {debug.requestStarted &&
        !debug.backendSuccess &&
        failedContacts.length ===
          0 && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "#450a0a",
              border:
                "1px solid #dc2626",
              color: "#fca5a5",
            }}
          >
            <strong>
              ✗ Backend Alert Failed
            </strong>

            <p
              style={{
                margin:
                  "6px 0 0",
                fontSize: "14px",
              }}
            >
              The emergency incident
              was saved locally, but
              the backend could not
              process the alert.
            </p>
          </div>
        )}

      {/* Contact results */}
      {hasContactResults && (
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
                    borderRadius: "8px",
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
                    {
                      result.contactName
                    }
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

      {/* Partial failure summary */}
      {failedContacts.length >
        0 &&
        debug.contactResults.length >
          failedContacts.length && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "#451a03",
              border:
                "1px solid #f59e0b",
              color: "#fcd34d",
            }}
          >
            <strong>
              ⚠ Partial Alert Delivery
            </strong>

            <p
              style={{
                margin:
                  "6px 0 0",
                fontSize: "14px",
              }}
            >
              Some emergency contacts
              were successfully notified,
              while one or more alerts
              failed.
            </p>
          </div>
        )}

      {/* Overall success */}
      {allContactsSuccessful && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            borderRadius: "8px",
            background: "#14532d",
            border:
              "1px solid #22c55e",
          }}
        >
          <strong>
            ✓ All Emergency Contacts
            Processed Successfully
          </strong>
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