import "./EmergencyCard.css";

interface EmergencyCardProps {
  emergency: boolean;
}

/**
 * EmergencyCard
 *
 * Displays the current emergency state.
 */
const EmergencyCard = ({
  emergency,
}: EmergencyCardProps) => {
  return (
    <section className="emergency-card">
      <h2> Emergency Status</h2>

      <div
        className={
          emergency
            ? "emergency danger"
            : "emergency safe"
        }
      >
        {emergency
          ? "Emergency Detected"
          : "No Emergency Detected"}
      </div>
    </section>
  );
};

export default EmergencyCard;