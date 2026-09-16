import { useState } from "react";

import EmergencyContactService from "../services/EmergencyContactService";
import EmergencyContact from "../components/Emergency/EmergencyContact";

interface EmergencyContactsPageProps {
  onBack: () => void;
  onAddContact: () => void;
}

const EmergencyContactsPage = ({
  onBack,
  onAddContact,
}: EmergencyContactsPageProps) => {
  const [editingContactId, setEditingContactId] =
    useState<string | null>(null);

  const [refresh, setRefresh] =
    useState(0);

  const contacts =
    EmergencyContactService.getContacts();

  const handleRefresh = () => {
    setRefresh(
      (value) => value + 1
    );

    setEditingContactId(null);
  };

  const handleRemove = (
    contactId: string
  ) => {
    EmergencyContactService.removeContact(
      contactId
    );

    setRefresh(
      (value) => value + 1
    );
  };

  void refresh;

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

          {contacts.length === 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                borderRadius: "10px",
                background: "#1f2937",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  marginTop: 0,
                }}
              >
                No emergency contacts
                have been added yet.
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

          {contacts.length > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginTop: "20px",
                  marginBottom: "15px",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <p
                  style={{
                    margin: 0,
                  }}
                >
                  {contacts.length}{" "}
                  emergency contact
                  {contacts.length !== 1
                    ? "s"
                    : ""}
                </p>

                <button
                  type="button"
                  onClick={onAddContact}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  + Add Contact
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {contacts.map(
                  (contact) => (
                    <div
                      key={contact.id}
                      style={{
                        padding: "18px",
                        borderRadius: "10px",
                        background:
                          "#1f2937",
                      }}
                    >
                      {editingContactId ===
                      contact.id ? (
                        <EmergencyContact
                          contactId={
                            contact.id
                          }
                          onSaved={
                            handleRefresh
                          }
                        />
                      ) : (
                        <>
                          <h3
                            style={{
                              marginTop: 0,
                              marginBottom:
                                "8px",
                            }}
                          >
                            {contact.name}
                          </h3>

                          <p
                            style={{
                              margin:
                                "0 0 15px",
                            }}
                          >
                            <strong>
                              Phone:
                            </strong>{" "}
                            {contact.phone}
                          </p>

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "10px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setEditingContactId(
                                  contact.id
                                )
                              }
                              style={{
                                padding:
                                  "9px 16px",
                                borderRadius:
                                  "8px",
                                border:
                                  "none",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  "bold",
                              }}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemove(
                                  contact.id
                                )
                              }
                              style={{
                                padding:
                                  "9px 16px",
                                borderRadius:
                                  "8px",
                                border:
                                  "none",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  "bold",
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default EmergencyContactsPage;