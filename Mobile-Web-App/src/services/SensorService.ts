import type { AccelerometerData } from "../types/sensor";

class SensorService {
  private listener: ((event: DeviceMotionEvent) => void) | null = null;
  private isRunning = false;

  /**
   * Starts listening to accelerometer data.
   * Returns true if the sensor started successfully.
   */
  async start(
    callback: (data: AccelerometerData) => void
  ): Promise<boolean> {
    // Prevent duplicate listeners
    if (this.isRunning) {
      return true;
    }

    // Check browser support
    if (!("DeviceMotionEvent" in window)) {
      console.warn("DeviceMotion API is not supported on this device.");
      return false;
    }

    // iOS 13+ permission request
    type DeviceMotionEventIOS = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const motionEvent = DeviceMotionEvent as unknown as DeviceMotionEventIOS;

    if (typeof motionEvent.requestPermission === "function") {
      try {
        const permission = await motionEvent.requestPermission();

        if (permission !== "granted") {
          console.warn("Motion permission denied.");
          return false;
        }
      } catch (error) {
        console.error("Failed to request motion permission:", error);
        return false;
      }
    }

    // Create listener
    this.listener = (event: DeviceMotionEvent) => {
      const x = event.accelerationIncludingGravity?.x ?? 0;
      const y = event.accelerationIncludingGravity?.y ?? 0;
      const z = event.accelerationIncludingGravity?.z ?? 0;

      callback({
        x,
        y,
        z,
        magnitude: Math.sqrt(x * x + y * y + z * z),
        timestamp: Date.now(),
      });
    };

    // Register listener
    window.addEventListener("devicemotion", this.listener);

    this.isRunning = true;

    return true;
  }

  /**
   * Stops listening to accelerometer updates.
   */
  stop(): void {
    if (!this.listener) {
      return;
    }

    window.removeEventListener("devicemotion", this.listener);

    this.listener = null;
    this.isRunning = false;
  }

  /**
   * Returns whether the service is running.
   */
  get running(): boolean {
    return this.isRunning;
  }
}

export default new SensorService();