import EmergencyContact from "../components/Emergency/EmergencyContact";

interface AddEmergencyContactPageProps {
  onBack: () => void;
}

const AddEmergencyContactPage = ({
  onBack,
}: AddEmergencyContactPageProps) => {
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

        <EmergencyContact />

      </main>

    </div>
  );
};

export default AddEmergencyContactPage;