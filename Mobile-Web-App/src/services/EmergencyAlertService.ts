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

    this.debugState.serviceCalled =
      true;

    this.debugState.error = null;

    const contacts =
      EmergencyContactService.getContacts();

    console.log(
      "📱 Emergency contacts:",
      contacts
    );

    if (contacts.length === 0) {
      console.warn(
        "⚠️ No emergency contacts configured."
      );

      this.debugState.contactFound =
        false;

      this.debugState.error =
        "No emergency contacts configured.";

      return false;
    }

    this.debugState.contactFound =
      true;

    if (!location) {
      console.warn(
        "⚠️ Emergency location unavailable."
      );

      this.debugState.locationAvailable =
        false;

      this.debugState.error =
        "Emergency location unavailable.";

      return false;
    }

    this.debugState.locationAvailable =
      true;

    this.debugState.requestStarted =
      true;

    let allSuccessful = true;
    let lastStatus: number | null =
      null;
    let anySmsSent = false;

    for (const contact of contacts) {
      const payload = {
        contact: {
          name: contact.name,
          phone: contact.phone,
        },

        latitude:
          location.latitude,
        longitude:
          location.longitude,
        accuracy:
          location.accuracy,

        reason,

        timestamp: Date.now(),
      };

      console.log(
        "📤 Sending emergency alert to:",
        contact.name,
        contact.phone
      );

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
                JSON.stringify(
                  payload
                ),
            }
          );

        lastStatus =
          response.status;

        this.debugState.httpStatus =
          response.status;

        console.log(
          "📡 Backend HTTP status:",
          response.status
        );

        if (!response.ok) {
          console.error(
            "❌ Backend returned HTTP error:",
            response.status
          );

          allSuccessful = false;
          continue;
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

          allSuccessful = false;
          continue;
        }

        if (
          data.smsSent === true
        ) {
          anySmsSent = true;

          console.log(
            "✅ Mock SMS processed successfully for:",
            contact.name
          );
        }
      } catch (error) {
        console.error(
          "❌ Failed to connect to emergency backend:",
          error
        );

        allSuccessful = false;

        this.debugState.error =
          error instanceof Error
            ? error.message
            : "Unknown network error.";
      }
    }

    this.debugState.httpStatus =
      lastStatus;

    this.debugState.backendSuccess =
      allSuccessful;

    this.debugState.smsSent =
      anySmsSent;

    if (!allSuccessful) {
      this.debugState.error =
        this.debugState.error ??
        "One or more emergency alerts failed.";

      return false;
    }

    console.log(
      "✅ Emergency alerts delivered to all configured contacts."
    );

    return true;
  }
}

export default new EmergencyAlertService();