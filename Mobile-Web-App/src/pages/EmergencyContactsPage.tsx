import EmergencyContactService from "../services/EmergencyContactService";

interface EmergencyContactsPageProps {
  onBack: () => void;
  onAddContact: () => void;
}

const EmergencyContactsPage = ({
  onBack,
  onAddContact,
}: EmergencyContactsPageProps) => {
  const contact =
    EmergencyContactService.getContact();

  return (
    <div className="app">

      <main className="main-content">

        <button
          type="button"
          onClick={onBack}
          style={{
            marginBottom: "20px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <section className="diagnostics-card">

          <h2>
            Emergency Contacts
          </h2>

          {!contact && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "10px",
                background: "#1f2937",
              }}
            >
              <p>
                No emergency contact has been
                added yet.
              </p>

              <button
                type="button"
                onClick={onAddContact}
                style={{
                  marginTop: "10px",
                  padding: "12px 18px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                + Add Emergency Contact
              </button>
            </div>
          )}

          {contact && (
            <div
              style={{
                marginTop: "20px",
                padding: "18px",
                borderRadius: "10px",
                background: "#1f2937",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                }}
              >
                {contact.name}
              </h3>

              <p>
                <strong>
                  Phone:
                </strong>{" "}
                {contact.phone}
              </p>

              <button
                type="button"
                onClick={onAddContact}
                style={{
                  marginTop: "8px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Edit Contact
              </button>
            </div>
          )}

        </section>

      </main>

    </div>
  );
};

export default EmergencyContactsPage;