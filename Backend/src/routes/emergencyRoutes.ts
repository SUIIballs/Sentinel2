import { Router } from "express";

import SmsService from "../services/SmsService";

const router = Router();

/*
 * Simple phone connectivity test.
 *
 * Open this on the phone:
 * http://192.168.1.6:5000/api/emergency/test
 */
router.get("/test", (_req, res) => {
  console.log(
    "📱 PHONE TEST REQUEST RECEIVED"
  );

  return res.json({
    success: true,
    message:
      "Phone can reach emergency routes.",
  });
});

/*
 * Emergency alert endpoint.
 */
router.post("/alert", async (req, res) => {
  const {
    contact,
    latitude,
    longitude,
    accuracy,
    reason,
    timestamp,
  } = req.body;

  console.log(
    "🚨 EMERGENCY ALERT RECEIVED"
  );

  console.log(
    "Contact:",
    contact
  );

  console.log(
    "Latitude:",
    latitude
  );

  console.log(
    "Longitude:",
    longitude
  );

  console.log(
    "Accuracy:",
    accuracy
  );

  console.log(
    "Reason:",
    reason
  );

  console.log(
    "Timestamp:",
    timestamp
  );

  /*
   * Validate emergency data.
   */
  if (
    !contact ||
    !contact.phone ||
    latitude === undefined ||
    longitude === undefined ||
    !reason
  ) {
    console.warn(
      "⚠️ Invalid emergency request."
    );

    return res.status(400).json({
      success: false,
      message:
        "Missing required emergency information.",
    });
  }

  /*
   * Process simulated SMS.
   */
  const smsSent =
    await SmsService.sendEmergencySms(
      contact.phone,
      latitude,
      longitude,
      reason
    );

  /*
   * Handle mock SMS failure.
   */
  if (!smsSent) {
    console.error(
      "❌ Mock SMS processing failed."
    );

    return res.status(500).json({
      success: false,
      message:
        "Emergency received but SMS could not be sent.",
      smsSent: false,
    });
  }

  console.log(
    "✅ Emergency alert processed successfully."
  );

  return res.status(200).json({
    success: true,

    message:
      "Emergency alert processed successfully.",

    smsSent: true,

    data: {
      contact,

      latitude,

      longitude,

      accuracy:
        accuracy ?? null,

      reason,

      timestamp:
        timestamp ?? Date.now(),
    },
  });
});

export default router;