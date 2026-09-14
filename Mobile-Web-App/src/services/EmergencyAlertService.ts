import type { GPSData } from "../types/sensor";
import EmergencyContactService from "./EmergencyContactService";

export interface EmergencyDebugState {
  serviceCalled: boolean;
  contactFound: boolean;
  locationAvailable: boolean;
  requestStarted: boolean;
  httpStatus: number | null;
  backendSuccess: boolean;
  smsSent: boolean;
  error: string | null;
}

class EmergencyAlertService {
  private readonly backendUrl =
  "/api/emergency/alert";

  private debugState: EmergencyDebugState = {
    serviceCalled: false,
    contactFound: false,
    locationAvailable: false,
    requestStarted: false,
    httpStatus: null,
    backendSuccess: false,
    smsSent: false,
    error: null,
  };

  resetDebug(): void {
    this.debugState = {
      serviceCalled: false,
      contactFound: false,
      locationAvailable: false,
      requestStarted: false,
      httpStatus: null,
      backendSuccess: false,
      smsSent: false,
      error: null,
    };
  }

  getDebugState(): EmergencyDebugState {
    return {
      ...this.debugState,
    };
  }

  async sendEmergencyAlert(
    location: GPSData | null,
    reason = "Fall Detected"
  ): Promise<boolean> {
    console.log(
      "🔥 EmergencyAlertService.sendEmergencyAlert() CALLED"
    );

    this.debugState.serviceCalled = true;
    this.debugState.error = null;

    const contact =
      EmergencyContactService.getContact();

    console.log(
      "📱 Emergency contact:",
      contact
    );

    if (!contact) {
      console.warn(
        "⚠️ No emergency contact configured."
      );

      this.debugState.contactFound = false;
      this.debugState.error =
        "No emergency contact configured.";

      return false;
    }

    this.debugState.contactFound = true;

    if (!location) {
      console.warn(
        "⚠️ Emergency location unavailable."
      );

      this.debugState.locationAvailable = false;
      this.debugState.error =
        "Emergency location unavailable.";

      return false;
    }

    this.debugState.locationAvailable = true;

    const payload = {
      contact: {
        name: contact.name,
        phone: contact.phone,
      },

      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,

      reason,

      timestamp: Date.now(),
    };

    console.log(
      "📤 Sending emergency alert to backend:"
    );

    console.log(
      "Backend URL:",
      this.backendUrl
    );

    console.log(
      "Payload:",
      payload
    );

    this.debugState.requestStarted = true;

    try {
      const response =
        await fetch(
          this.backendUrl,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(payload),
          }
        );

      console.log(
        "📡 Backend HTTP status:",
        response.status
      );

      this.debugState.httpStatus =
        response.status;

      if (!response.ok) {
        console.error(
          "❌ Backend returned HTTP error:",
          response.status
        );

        this.debugState.error =
          `Backend HTTP error: ${response.status}`;

        return false;
      }

      const data =
        (await response.json()) as {
          success: boolean;
          message: string;
          smsSent?: boolean;
        };

      console.log(
        "📥 Backend emergency response:",
        data
      );

      if (!data.success) {
        console.warn(
          "⚠️ Backend rejected emergency alert."
        );

        this.debugState.backendSuccess =
          false;

        this.debugState.error =
          "Backend rejected emergency alert.";

        return false;
      }

      this.debugState.backendSuccess =
        true;

      this.debugState.smsSent =
        data.smsSent === true;

      if (data.smsSent) {
        console.log(
          "✅ Mock SMS processed successfully."
        );
      } else {
        console.warn(
          "⚠️ Backend response did not confirm mock SMS."
        );
      }

      console.log(
        "✅ Emergency alert delivered to backend."
      );

      return true;
    } catch (error) {
      console.error(
        "❌ Failed to connect to emergency backend:",
        error
      );

      this.debugState.error =
        error instanceof Error
          ? error.message
          : "Unknown network error.";

      return false;
    }
  }
}

export default new EmergencyAlertService();