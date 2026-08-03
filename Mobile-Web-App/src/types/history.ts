export interface EmergencyIncident {
  id: string;
  timestamp: number;

  latitude: number;
  longitude: number;
  accuracy: number;

  reason: string;

  cancelled: boolean;
}