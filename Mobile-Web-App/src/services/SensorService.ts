import type {
  MotionSensorData,
} from "../types/sensor";

type DeviceMotionEventIOS = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

class SensorService {
  private listener:
    ((event: DeviceMotionEvent) => void) | null = null;

  private isRunning = false;
  private permissionGranted = false;

  /**
   * Request motion permission (iOS only).
   *
   * This MUST be called directly from a user interaction,
   * such as pressing the Start Monitoring button.
   */
  async requestPermission(): Promise<boolean> {
    if (this.permissionGranted) {
      return true;
    }

    if (!("DeviceMotionEvent" in window)) {
      console.warn(
        "DeviceMotion is not supported by this browser."
      );

      return false;
    }

    // iOS-specific permission request
    const motionEvent =
      DeviceMotionEvent as unknown as DeviceMotionEventIOS;

    if (
      typeof motionEvent.requestPermission ===
      "function"
    ) {
      try {
        const result =
          await motionEvent.requestPermission();

        console.log(
          "Motion Permission:",
          result
        );

        if (result !== "granted") {
          console.warn(
            "Motion permission denied."
          );

          return false;
        }
      } catch (error) {
        console.error(
          "Motion permission error:",
          error
        );

        return false;
      }
    }

    this.permissionGranted = true;

    console.log(
      "Motion permission granted."
    );

    return true;
  }

  /**
   * Starts accelerometer + gyroscope monitoring.
   */
  async start(
    callback: (
      data: MotionSensorData
    ) => void
  ): Promise<boolean> {
    if (this.isRunning) {
      console.log(
        "SensorService is already running."
      );

      return true;
    }

    if (!this.permissionGranted) {
      console.warn(
        "Motion permission has not been granted."
      );

      return false;
    }

    console.log(
      "Starting motion sensors..."
    );

    this.listener = (
      event: DeviceMotionEvent
    ) => {
      // ==========================================
      // ACCELEROMETER
      // ==========================================

      const acceleration =
        event.accelerationIncludingGravity;

      const x =
        acceleration?.x ?? 0;

      const y =
        acceleration?.y ?? 0;

      const z =
        acceleration?.z ?? 0;

      const magnitude = Math.sqrt(
        x * x +
        y * y +
        z * z
      );

      // ==========================================
      // GYROSCOPE
      // ==========================================

      const rotation =
        event.rotationRate;

      const alpha =
        rotation?.alpha ?? 0;

      const beta =
        rotation?.beta ?? 0;

      const gamma =
        rotation?.gamma ?? 0;

      // ==========================================
      // TIMESTAMP
      // ==========================================

      const timestamp = Date.now();

      // ==========================================
      // COMBINED SENSOR DATA
      // ==========================================

      const sensorData: MotionSensorData = {
        acceleration: {
          x,
          y,
          z,
          magnitude,
          timestamp,
        },

        gyroscope: {
          alpha,
          beta,
          gamma,
          timestamp,
        },

        timestamp,
      };

      // Debug output
      console.log(
        "Motion Sensor Data:",
        sensorData
      );

      // Send combined data to MonitoringService
      callback(sensorData);
    };

    // ==========================================
    // REGISTER DEVICE MOTION LISTENER
    // ==========================================

    window.addEventListener(
      "devicemotion",
      this.listener
    );

    this.isRunning = true;

    console.log(
      "SensorService started successfully."
    );

    return true;
  }

  /**
   * Stops sensor monitoring.
   */
  stop(): void {
    if (!this.listener) {
      console.log(
        "SensorService is not running."
      );

      return;
    }

    window.removeEventListener(
      "devicemotion",
      this.listener
    );

    this.listener = null;
    this.isRunning = false;

    console.log(
      "SensorService stopped."
    );
  }

  /**
   * Returns whether the sensor service is running.
   */
  get running(): boolean {
    return this.isRunning;
  }
}

export default new SensorService();