import { useState } from "react";

import EmergencyContactService from "../../services/EmergencyContactService";

interface EmergencyContactProps {
  contactId?: string;
  onSaved?: () => void;
}

const EmergencyContact = ({
  contactId,
  onSaved,
}: EmergencyContactProps) => {
  const existingContact =
    contactId
      ? EmergencyContactService.getContact(
          contactId
        )
      : null;

  const [name, setName] =
    useState(
      existingContact?.name ?? ""
    );

  const [phone, setPhone] =
    useState(
      existingContact?.phone ?? ""
    );

  const [saved, setSaved] =
    useState(
      !!existingContact
    );

  const isEditing =
    !!contactId;

  const handleSave = () => {
    if (
      !name.trim() ||
      !phone.trim()
    ) {
      alert(
        "Please enter both contact name and phone number."
      );

      return;
    }

    if (isEditing && contactId) {
      const updated =
        EmergencyContactService.updateContact(
          contactId,
          {
            name,
            phone,
          }
        );

      if (updated) {
        setSaved(true);
        onSaved?.();
      }

      return;
    }

    EmergencyContactService.saveContact({
      name,
      phone,
    });

    setSaved(true);

    onSaved?.();
  };

  const handleRemove = () => {
    if (
      !contactId
    ) {
      return;
    }

    EmergencyContactService.removeContact(
      contactId
    );

    setName("");
    setPhone("");
    setSaved(false);

    onSaved?.();
  };

  return (
    <section
      className="diagnostics-card"
      style={{
        marginTop: "20px",
      }}
    >
      <h2>
        {isEditing
          ? "Edit Emergency Contact"
          : "Emergency Contact"}
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "500px",
        }}
      >
        <label>
          <strong>
            Contact Name
          </strong>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            placeholder="e.g. Parent"
            style={{
              display: "block",
              width: "100%",
              marginTop: "6px",
              padding: "10px",
              borderRadius: "8px",
              border:
                "1px solid #475569",
              boxSizing: "border-box",
            }}
          />
        </label>

        <label>
          <strong>
            Phone Number
          </strong>

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value
              )
            }
            placeholder="e.g. +91XXXXXXXXXX"
            style={{
              display: "block",
              width: "100%",
              marginTop: "6px",
              padding: "10px",
              borderRadius: "8px",
              border:
                "1px solid #475569",
              boxSizing: "border-box",
            }}
          />
        </label>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "5px",
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding:
                "10px 18px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isEditing
              ? "Update Contact"
              : "Save Contact"}
          </button>

          {isEditing &&
            saved && (
              <button
                type="button"
                onClick={
                  handleRemove
                }
                style={{
                  padding:
                    "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight:
                    "bold",
                }}
              >
                Remove
              </button>
            )}
        </div>

        {saved && (
          <p
            style={{
              margin: 0,
            }}
          >
            Emergency contact configured:
            {" "}
            <strong>
              {name}
            </strong>
            {" "}
            ({phone})
          </p>
        )}
      </div>
    </section>
  );
};

export default EmergencyContact;