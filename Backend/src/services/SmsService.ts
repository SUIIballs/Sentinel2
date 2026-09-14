class SmsService {
  async sendEmergencySms(
    to: string,
    latitude: number,
    longitude: number,
    reason: string
  ): Promise<boolean> {
    const message =
      `🚨 SENTINEL EMERGENCY ALERT\n\n` +
      `Reason: ${reason}\n` +
      `A possible emergency has been detected.\n\n` +
      `Location:\n` +
      `Latitude: ${latitude.toFixed(6)}\n` +
      `Longitude: ${longitude.toFixed(6)}\n\n` +
      `Please check on the person immediately.`;

    console.log(
      "========================================"
    );

    console.log(
      "📱 MOCK SMS SERVICE"
    );

    console.log(
      "========================================"
    );

    console.log(
      "📤 SMS would be sent to:",
      to
    );

    console.log(
      "📨 Message:"
    );

    console.log(message);

    console.log(
      "========================================"
    );

    return true;
  }
}

export default new SmsService();