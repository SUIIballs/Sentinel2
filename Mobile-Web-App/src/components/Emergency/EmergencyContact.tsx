import { useState } from "react";

import EmergencyContactService, {
  type EmergencyContact as EmergencyContactData,
} from "../../services/EmergencyContactService";

const EmergencyContact = () => {
  const existingContact =
    EmergencyContactService.getContact();

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

    const contact: EmergencyContactData = {
      name: name.trim(),
      phone: phone.trim(),
    };

    EmergencyContactService.saveContact(
      contact
    );

    setSaved(true);
  };

  const handleRemove = () => {
    EmergencyContactService.removeContact();

    setName("");
    setPhone("");
    setSaved(false);
  };

  return (
    <section
      className="diagnostics-card"
      style={{
        marginTop: "20px",
      }}
    >
      <h2>
        Emergency Contact
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
            Save Contact
          </button>

          {saved && (
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