import type { EmergencyIncident } from "../../types/history";

interface HistoryCardProps {
  incident: EmergencyIncident;
}

const HistoryCard = ({
  incident,
}: HistoryCardProps) => {
  return (
    <div
      style={{
        background: "#1f2937",
        border: "1px solid #334155",
        borderRadius: "12px",
        padding: "18px",
        marginBottom: "20px",
        color: "white",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      <h3
        style={{
          color: incident.cancelled
            ? "#22c55e"
            : "#ef4444",
          marginBottom: "12px",
        }}
      >
        {incident.cancelled
          ? "🟢 Cancelled"
          : "🔴 Emergency Triggered"}
      </h3>

      <p>
        <strong>Time:</strong>{" "}
        {new Date(
          incident.timestamp
        ).toLocaleString()}
      </p>

      <p>
        <strong>Latitude:</strong>{" "}
        {incident.latitude.toFixed(6)}
      </p>

      <p>
        <strong>Longitude:</strong>{" "}
        {incident.longitude.toFixed(6)}
      </p>

      <p>
        <strong>Accuracy:</strong>{" "}
        {incident.accuracy} m
      </p>

      <p>
        <strong>Reason:</strong>{" "}
        {incident.reason}
      </p>
    </div>
  );
};

export default HistoryCard;