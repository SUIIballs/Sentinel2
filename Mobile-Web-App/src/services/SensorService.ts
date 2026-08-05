import type { AccelerometerData } from "../types/sensor";

type DeviceMotionEventIOS = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

class SensorService {
  private listener: ((event: DeviceMotionEvent) => void) | null = null;
  private isRunning = false;
  private permissionGranted = false;

  /**
   * Request motion permission (iOS only).
   * This MUST be called directly from a button click.
   */
  async requestPermission(): Promise<boolean> {
    if (this.permissionGranted) {
      return true;
    }

    if (!("DeviceMotionEvent" in window)) {
      console.warn("DeviceMotion not supported.");
      return false;
    }

    const motionEvent =
      DeviceMotionEvent as unknown as DeviceMotionEventIOS;

    if (typeof motionEvent.requestPermission === "function") {
      try {
        const result =
          await motionEvent.requestPermission();

        console.log("Motion Permission:", result);

        if (result !== "granted") {
          return false;
        }
      } catch (err) {
        console.error(err);
        return false;
      }
    }

    this.permissionGranted = true;

    return true;
  }

  /**
   * Starts sensor monitoring.
   */
  async start(
    callback: (data: AccelerometerData) => void
  ): Promise<boolean> {
    if (this.isRunning) {
      return true;
    }

    if (!this.permissionGranted) {
      console.warn(
        "Motion permission has not been granted."
      );
      return false;
    }

    this.listener = (event: DeviceMotionEvent) => {
      const x =
        event.accelerationIncludingGravity?.x ?? 0;

      const y =
        event.accelerationIncludingGravity?.y ?? 0;

      const z =
        event.accelerationIncludingGravity?.z ?? 0;

      callback({
        x,
        y,
        z,
        magnitude: Math.sqrt(
          x * x +
            y * y +
            z * z
        ),
        timestamp: Date.now(),
      });
    };

    window.addEventListener(
      "devicemotion",
      this.listener
    );

    this.isRunning = true;

    console.log("SensorService started.");

    return true;
  }

  stop(): void {
    if (!this.listener) {
      return;
    }

    window.removeEventListener(
      "devicemotion",
      this.listener
    );

    this.listener = null;
    this.isRunning = false;

    console.log("SensorService stopped.");
  }

  get running(): boolean {
    return this.isRunning;
  }
}

export default new SensorService();