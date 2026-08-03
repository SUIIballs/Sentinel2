class EmergencyService {
  private timer: number | null = null;
  private secondsRemaining = 10;

  private tickCallback?: (seconds: number) => void;
  private finishCallback?: () => void;

  startCountdown(
    onTick: (seconds: number) => void,
    onFinish: () => void,
    duration = 10
  ) {
    this.stop();

    this.secondsRemaining = duration;
    this.tickCallback = onTick;
    this.finishCallback = onFinish;

    this.tickCallback(this.secondsRemaining);

    this.timer = window.setInterval(() => {
      this.secondsRemaining--;

      this.tickCallback?.(this.secondsRemaining);

      if (this.secondsRemaining <= 0) {
        this.stop();
        this.finishCallback?.();
      }
    }, 1000);
  }

  cancel() {
    this.stop();
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.secondsRemaining = 10;
  }

  isRunning() {
    return this.timer !== null;
  }

  getRemainingTime() {
    return this.secondsRemaining;
  }
}

export default new EmergencyService();