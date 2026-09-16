export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

class EmergencyContactService {
  private readonly storageKey =
    "sentinel_emergency_contacts";

  saveContact(
    contact: Omit<EmergencyContact, "id">
  ): EmergencyContact {
    const contacts =
      this.getContacts();

    const newContact: EmergencyContact = {
      id: crypto.randomUUID(),
      name: contact.name.trim(),
      phone: contact.phone.trim(),
    };

    contacts.push(newContact);

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(contacts)
    );

    console.log(
      "Emergency contact added:",
      newContact
    );

    return newContact;
  }

  updateContact(
    id: string,
    updatedContact: Omit<EmergencyContact, "id">
  ): boolean {
    const contacts =
      this.getContacts();

    const index =
      contacts.findIndex(
        (contact) =>
          contact.id === id
      );

    if (index === -1) {
      console.warn(
        "Emergency contact not found:",
        id
      );

      return false;
    }

    contacts[index] = {
      id,
      name: updatedContact.name.trim(),
      phone: updatedContact.phone.trim(),
    };

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(contacts)
    );

    console.log(
      "Emergency contact updated:",
      contacts[index]
    );

    return true;
  }

  getContacts(): EmergencyContact[] {
    const stored =
      localStorage.getItem(
        this.storageKey
      );

    if (!stored) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as EmergencyContact[];
    } catch (error) {
      console.error(
        "Failed to read emergency contacts:",
        error
      );

      return [];
    }
  }

  getContact(
    id: string
  ): EmergencyContact | null {
    const contacts =
      this.getContacts();

    return (
      contacts.find(
        (contact) =>
          contact.id === id
      ) ?? null
    );
  }

  removeContact(
    id: string
  ): boolean {
    const contacts =
      this.getContacts();

    const updatedContacts =
      contacts.filter(
        (contact) =>
          contact.id !== id
      );

    if (
      updatedContacts.length ===
      contacts.length
    ) {
      console.warn(
        "Emergency contact not found:",
        id
      );

      return false;
    }

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        updatedContacts
      )
    );

    console.log(
      "Emergency contact removed:",
      id
    );

    return true;
  }

  hasContacts(): boolean {
    return (
      this.getContacts().length > 0
    );
  }

  clearAll(): void {
    localStorage.removeItem(
      this.storageKey
    );

    console.log(
      "All emergency contacts removed."
    );
  }
}

export default new EmergencyContactService();