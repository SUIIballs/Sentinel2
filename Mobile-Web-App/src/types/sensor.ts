export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}

export interface GyroscopeData {
  alpha: number;
  beta: number;
  gamma: number;
  timestamp: number;
}

export interface MotionSensorData {
  acceleration: AccelerometerData;
  gyroscope: GyroscopeData;
  timestamp: number;
}

export interface GPSData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface MonitoringState {
  isMonitoring: boolean;
  isEmergency: boolean;
}