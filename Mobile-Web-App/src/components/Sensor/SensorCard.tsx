import "./SensorCard.css";

interface SensorCardProps {
  x: number | null;
  y: number | null;
  z: number | null;
  magnitude: number | null;
  status: string;
  onRequestPermission: () => void;
}

/**
 * Displays the current accelerometer values.
 */
const SensorCard = ({
  x,
  y,
  z,
  magnitude,
  status,
  onRequestPermission,
}: SensorCardProps) => {
  return (
    <section className="sensor-card">
      <h2>Motion Sensor</h2>

      <div className="sensor-value">
        <span>Acceleration X</span>
        <span>{x !== null ? `${x.toFixed(2)} m/s²` : "--"}</span>
      </div>

      <div className="sensor-value">
        <span>Acceleration Y</span>
        <span>{y !== null ? `${y.toFixed(2)} m/s²` : "--"}</span>
      </div>

      <div className="sensor-value">
        <span>Acceleration Z</span>
        <span>{z !== null ? `${z.toFixed(2)} m/s²` : "--"}</span>
      </div>

      <div className="sensor-value">
        <span>Magnitude</span>
        <span>
          {magnitude !== null
            ? `${magnitude.toFixed(2)} m/s²`
            : "--"}
        </span>
      </div>

      <div className="status">
        <strong>Status:</strong> {status}
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