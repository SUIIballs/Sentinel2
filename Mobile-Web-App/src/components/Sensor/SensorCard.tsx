import "./SensorCard.css";

interface SensorCardProps {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  status: string;
  devicePosition: string;
  onRequestPermission: () => void;
}

/**
 * Displays the current device orientation values.
 */
const SensorCard = ({
  alpha,
  beta,
  gamma,
  status,
  devicePosition,
  onRequestPermission,
}: SensorCardProps) => {
  return (
    <section className="sensor-card">
      <h2>Motion Sensor</h2>

      <div className="sensor-value">
        <span>Alpha (Z)</span>
        <span>{alpha != null ? `${alpha.toFixed(2)}°` : "--"}</span>
      </div>

      <div className="sensor-value">
        <span>Beta (X)</span>
        <span>{beta != null ? `${beta.toFixed(2)}°` : "--"}</span>
      </div>

      <div className="sensor-value">
        <span>Gamma (Y)</span>
        <span>{gamma != null ? `${gamma.toFixed(2)}°` : "--"}</span>
      </div>

      <div className="status">
        <strong>Status:</strong> {status}
      </div>

      <div className="device-position">
        <strong>Device Position</strong>
        <p>{devicePosition}</p>
      </div>

      <button
        className="permission-btn"
        onClick={onRequestPermission}
      >
        Request Sensor Permission
      </button>
    </section>
  );
};

export default SensorCard;