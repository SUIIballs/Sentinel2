import "./StatusCard.css";

interface StatusCardProps {
  title: string;
  status: string;
  color: "green" | "yellow" | "red";
}

const StatusCard = ({
  title,
  status,
  color,
}: StatusCardProps) => {
  const currentTime = new Date().toLocaleTimeString();

  return (
    <section className="status-card">
      <h2>{title}</h2>

      <div className="status-content">
        <span className={`status-dot ${color}`}></span>

        <span className="status-text">
          {status}
        </span>
      </div>

      <p className="last-updated">
        Last Updated: {currentTime}
      </p>
    </section>
  );
};

export default StatusCard;