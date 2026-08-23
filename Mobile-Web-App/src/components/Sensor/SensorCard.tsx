import "./SensorCard.css";

interface SensorCardProps {
  // Accelerometer
  x: number | null;
  y: number | null;
  z: number | null;
  magnitude: number | null;

  // Gyroscope
  alpha: number | null;
  beta: number | null;
  gamma: number | null;

  status: string;
  buttonText: string;
  onRequestPermission: () => void;
}

/**
 * Displays the current accelerometer and gyroscope values.
 */
const SensorCard = ({
  x,
  y,
  z,
  magnitude,
  alpha,
  beta,
  gamma,
  status,
  buttonText,
  onRequestPermission,
}: SensorCardProps) => {
  return (
    <section className="sensor-card">
      <h2>Motion Sensor</h2>

      {/* ================================
          ACCELEROMETER
      ================================= */}

      <div className="sensor-value">
        <span>Acceleration X</span>
        <span>
          {x !== null
            ? `${x.toFixed(2)} m/s²`
            : "--"}
        </span>
      </div>

      <div className="sensor-value">
        <span>Acceleration Y</span>
        <span>
          {y !== null
            ? `${y.toFixed(2)} m/s²`
            : "--"}
        </span>
      </div>

      <div className="sensor-value">
        <span>Acceleration Z</span>
        <span>
          {z !== null
            ? `${z.toFixed(2)} m/s²`
            : "--"}
        </span>
      </div>

      <div className="sensor-value">
        <span>Magnitude</span>
        <span>
          {magnitude !== null
            ? `${magnitude.toFixed(2)} m/s²`
            : "--"}
        </span>
      </div>

      {/* ================================
          GYROSCOPE
      ================================= */}

      <div className="sensor-value">
        <span>Gyroscope Alpha</span>
        <span>
          {alpha !== null
            ? `${alpha.toFixed(2)} °/s`
            : "--"}
        </span>
      </div>

      <div className="sensor-value">
        <span>Gyroscope Beta</span>
        <span>
          {beta !== null
            ? `${beta.toFixed(2)} °/s`
            : "--"}
        </span>
      </div>

      <div className="sensor-value">
        <span>Gyroscope Gamma</span>
        <span>
          {gamma !== null
            ? `${gamma.toFixed(2)} °/s`
            : "--"}
        </span>
      </div>

      {/* ================================
          STATUS
      ================================= */}

      <div className="status">
        <strong>Status:</strong> {status}
      </div>

      <button
        className="permission-btn"
        onClick={onRequestPermission}
      >
        {buttonText}
      </button>
    </section>
  );
};

export default SensorCard;