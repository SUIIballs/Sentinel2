interface EmergencyCountdownProps {
  active: boolean;
  seconds: number;
  onCancel: () => void;
}

const EmergencyCountdown = ({
  active,
  seconds,
  onCancel,
}: EmergencyCountdownProps) => {
  if (!active) return null;

  return (
    <div className="countdown-card">
      <h2>⚠ Possible Fall Detected</h2>

      <h1>{seconds}</h1>

      <p>
        Emergency alert will be sent unless cancelled.
      </p>

      <button onClick={onCancel}>
        I'm Safe
      </button>
    </div>
  );
};

export default EmergencyCountdown;