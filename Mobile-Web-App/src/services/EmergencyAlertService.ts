import type { GPSData } from "../types/sensor";
import EmergencyContactService from "./EmergencyContactService";

export interface ContactAlertResult {
  contactId: string;
  contactName: string;
  phone: string;
  success: boolean;
  httpStatus: number | null;
  smsSent: boolean;
  error: string | null;
}

export interface EmergencyDebugState {
  serviceCalled: boolean;
  contactFound: boolean;
  locationAvailable: boolean;
  requestStarted: boolean;
  httpStatus: number | null;
  backendSuccess: boolean;
  smsSent: boolean;
  error: string | null;
  contactResults: ContactAlertResult[];
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
    contactResults: [],
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
      contactResults: [],
    };
  }

  getDebugState(): EmergencyDebugState {
    return {
      ...this.debugState,
      contactResults:
        this.debugState.contactResults.map(
          (result) => ({
            ...result,
          })
        ),
    };
  }

  async sendEmergencyAlert(
    location: GPSData | null,
    reason = "Fall Detected"
  ): Promise<boolean> {
    console.log(
      "🔥 EmergencyAlertService.sendEmergencyAlert() CALLED"
    );

    this.resetDebug();

    this.debugState.serviceCalled =
      true;

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
    let anySmsSent = false;

    for (const contact of contacts) {
      const result: ContactAlertResult = {
        contactId: contact.id,
        contactName: contact.name,
        phone: contact.phone,
        success: false,
        httpStatus: null,
        smsSent: false,
        error: null,
      };

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

        result.httpStatus =
          response.status;

        this.debugState.httpStatus =
          response.status;

        console.log(
          "📡 Backend HTTP status for",
          contact.name,
          ":",
          response.status
        );

        if (!response.ok) {
          result.error =
            `Backend HTTP error: ${response.status}`;

          console.error(
            "❌ Alert failed for:",
            contact.name,
            result.error
          );

          allSuccessful = false;

          this.debugState.contactResults.push(
            result
          );

          continue;
        }

        const data =
          (await response.json()) as {
            success: boolean;
            message: string;
            smsSent?: boolean;
          };

        console.log(
          "📥 Backend emergency response for",
          contact.name,
          ":",
          data
        );

        if (!data.success) {
          result.error =
            "Backend rejected emergency alert.";

          console.warn(
            "⚠️ Backend rejected alert for:",
            contact.name
          );

          allSuccessful = false;

          this.debugState.contactResults.push(
            result
          );

          continue;
        }

        result.success = true;
        result.smsSent =
          data.smsSent === true;

        if (result.smsSent) {
          anySmsSent = true;

          console.log(
            "✅ Mock SMS processed successfully for:",
            contact.name
          );
        }

        console.log(
          "✅ Emergency alert processed successfully for:",
          contact.name
        );

        this.debugState.contactResults.push(
          result
        );
      } catch (error) {
        result.error =
          error instanceof Error
            ? error.message
            : "Unknown network error.";

        console.error(
          "❌ Failed to connect to emergency backend for:",
          contact.name,
          error
        );

        allSuccessful = false;

        this.debugState.contactResults.push(
          result
        );
      }
    }

    this.debugState.backendSuccess =
      allSuccessful;

    this.debugState.smsSent =
      anySmsSent;

    const failedContacts =
      this.debugState.contactResults.filter(
        (result) =>
          !result.success
      );

    if (failedContacts.length > 0) {
      this.debugState.error =
        `${failedContacts.length} emergency contact alert${
          failedContacts.length !== 1
            ? "s"
            : ""
        } failed.`;

      console.warn(
        "⚠️ Some emergency alerts failed:",
        failedContacts
      );

      return false;
    }

    console.log(
      "========================================"
    );

    console.log(
      "✅ ALL EMERGENCY ALERTS PROCESSED"
    );

    console.log(
      "Contacts processed:",
      contacts.length
    );

    console.log(
      "========================================"
    );

    return true;
  }
}

export default new EmergencyAlertService();