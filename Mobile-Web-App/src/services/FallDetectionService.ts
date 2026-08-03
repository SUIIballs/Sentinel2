import type { AccelerometerData } from "../types/sensor";

class FallDetectionService {
  private readonly FREE_FALL_THRESHOLD = 4.0;
  private readonly IMPACT_THRESHOLD = 25.0;
  private readonly STILLNESS_THRESHOLD = 2.0;
  private readonly STILLNESS_TIME = 2000; // ms

  private freeFallDetected = false;
  private impactDetected = false;
  private impactTime = 0;

  /**
   * Returns true when a complete fall sequence is detected.
   */
  detectFall(data: AccelerometerData): boolean {
    const magnitude = data.magnitude;

    // Stage 1: Free fall
    if (!this.freeFallDetected && magnitude < this.FREE_FALL_THRESHOLD) {
      this.freeFallDetected = true;
      console.log("🟡 Free Fall Detected");
      return false;
    }

    // Stage 2: Impact
    if (
      this.freeFallDetected &&
      !this.impactDetected &&
      magnitude > this.IMPACT_THRESHOLD
    ) {
      this.impactDetected = true;
      this.impactTime = Date.now();
      console.log("🟠 Impact Detected");
      return false;
    }

    // Stage 3: Stillness
    if (this.freeFallDetected && this.impactDetected) {
      const elapsed = Date.now() - this.impactTime;

      if (
        elapsed >= this.STILLNESS_TIME &&
        magnitude < this.STILLNESS_THRESHOLD
      ) {
        console.log("🔴 FALL CONFIRMED");
        this.reset();
        return true;
      }

      if (
        elapsed >= this.STILLNESS_TIME &&
        magnitude >= this.STILLNESS_THRESHOLD
      ) {
        console.log("🟢 False Alarm");
        this.reset();
      }
    }

    return false;
  }

  /**
   * Resets detector state.
   */
  reset(): void {
    this.freeFallDetected = false;
    this.impactDetected = false;
    this.impactTime = 0;
  }
}

export default new FallDetectionService();