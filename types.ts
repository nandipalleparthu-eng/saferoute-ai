
export enum DrivingMode {
  TRAFFIC = 'Traffic',
  HIGHWAY = 'Highway',
  DEPOT = 'Depot',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface SensorData {
  leftDistance: number;   // cm
  rightDistance: number;  // cm
  closingSpeed: number;   // m/s
  vehicleSpeed: number;   // km/h
  drivingMode: DrivingMode;
}

export interface AssessmentResult {
  riskLevel: RiskLevel;
  explanation: string;
  timestamp: number;
  data: SensorData;
}
