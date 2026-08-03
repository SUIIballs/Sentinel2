import type { EmergencyIncident } from "../types/history";

class HistoryService {
  private incidents: EmergencyIncident[] = [];

  /**
   * Save a new emergency incident.
   */
  addIncident(incident: EmergencyIncident): void {
    this.incidents.unshift(incident);
  }

  /**
   * Get all incidents.
   */
  getIncidents(): EmergencyIncident[] {
    return [...this.incidents];
  }

  /**
   * Remove all incidents.
   */
  clearHistory(): void {
    this.incidents = [];
  }

  /**
   * Number of incidents.
   */
  getCount(): number {
    return this.incidents.length;
  }
}

export default new HistoryService();