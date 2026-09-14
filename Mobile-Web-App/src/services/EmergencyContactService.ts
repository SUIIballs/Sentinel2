export interface EmergencyContact {
  name: string;
  phone: string;
}

class EmergencyContactService {
  private readonly storageKey =
    "sentinel_emergency_contact";

  saveContact(
    contact: EmergencyContact
  ): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(contact)
    );

    console.log(
      "Emergency contact saved:",
      contact
    );
  }

  getContact():
    EmergencyContact | null {
    const stored =
      localStorage.getItem(
        this.storageKey
      );

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(
        stored
      ) as EmergencyContact;
    } catch (error) {
      console.error(
        "Failed to read emergency contact:",
        error
      );

      return null;
    }
  }

  removeContact(): void {
    localStorage.removeItem(
      this.storageKey
    );

    console.log(
      "Emergency contact removed."
    );
  }

  hasContact(): boolean {
    return this.getContact() !== null;
  }
}

export default new EmergencyContactService();