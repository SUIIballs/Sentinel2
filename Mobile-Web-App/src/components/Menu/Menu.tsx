interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: () => void;
  onViewContacts: () => void;
  onViewHistory: () => void;
}

const Menu = ({
  isOpen,
  onClose,
  onAddContact,
  onViewContacts,
  onViewHistory,
}: MenuProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background:
            "rgba(0, 0, 0, 0.45)",
          zIndex: 9998,
        }}
      />

      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "min(85vw, 340px)",
          height: "100vh",
          background: "#111827",
          color: "white",
          zIndex: 9999,
          padding: "24px",
          boxSizing: "border-box",
          boxShadow:
            "-8px 0 30px rgba(0, 0, 0, 0.35)",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              margin: 0,
            }}
          >
            Menu
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background:
                "transparent",
              color: "white",
              fontSize: "26px",
              cursor: "pointer",
            }}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >

          <button
            type="button"
            onClick={() => {
              onAddContact();
              onClose();
            }}
            style={{
              width: "100%",
              padding: "15px",
              textAlign: "left",
              borderRadius: "10px",
              border:
                "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            + Add Emergency Contact
          </button>

          <button
            type="button"
            onClick={() => {
              onViewContacts();
              onClose();
            }}
            style={{
              width: "100%",
              padding: "15px",
              textAlign: "left",
              borderRadius: "10px",
              border:
                "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Emergency Contacts
          </button>

          <button
            type="button"
            onClick={() => {
              onViewHistory();
              onClose();
            }}
            style={{
              width: "100%",
              padding: "15px",
              textAlign: "left",
              borderRadius: "10px",
              border:
                "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            View History
          </button>

        </div>

      </aside>
    </>
  );
};

export default Menu;