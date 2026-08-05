import { useState } from "react";

import HistoryService from "../services/HistoryService";
import HistoryCard from "../components/History/HistoryCard";

interface HistoryPageProps {
  onBack: () => void;
}

const HistoryPage = ({ onBack }: HistoryPageProps) => {
  const [incidents, setIncidents] = useState(
    HistoryService.getIncidents()
  );

  const refreshHistory = () => {
    setIncidents(HistoryService.getIncidents());
  };

  const clearHistory = () => {
    HistoryService.clearHistory();
    setIncidents([]);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
        
          "linear-gradient(to bottom, #091120, #111827)",
        padding: "40px",
        color: "white",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "36px",
          marginBottom: "30px",
        }}
      >
        📜 Emergency History
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          marginBottom: "35px",
        }}
      >
        <button
          onClick={onBack}
          style={buttonStyle}
        >
          ← Back
        </button>

        <button
          onClick={refreshHistory}
          style={buttonStyle}
        >
          🔄 Refresh
        </button>

        <button
          onClick={clearHistory}
          style={dangerButtonStyle}
        >
          🗑 Clear History
        </button>
      </div>

      {incidents.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: "#1f2937",
            borderRadius: "12px",
            border: "1px solid #334155",
          }}
        >
          <h2>No incidents recorded.</h2>

          <p>
            Emergency history will appear here after an
            emergency is triggered.
          </p>
        </div>
      ) : (
        incidents.map((incident) => (
          <HistoryCard
            key={incident.id}
            incident={incident}
          />
        ))
      )}
    </main>
  );
};

const buttonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "12px 22px",
  cursor: "pointer",
  fontWeight: "bold" as const,
};

const dangerButtonStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "12px 22px",
  cursor: "pointer",
  fontWeight: "bold" as const,
};

export default HistoryPage;