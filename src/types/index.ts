// Define base interfaces
export interface DeviceType {
  id: string;
  name: string;  // 'Pressure Regulator' | 'Glucose Regulator' | 'Pulse Regulator'
  code: string;  // 'pressure-regulator' | 'glucose-regulator' | 'pulse-regulator'
  image?: string;
  parameters?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  yearOfManufacturing?: string;
  validity?: string;
  remarks?: string;
  manualUrl?: string;
  videoUrl?: string;
}

export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  providerId: string;
  activity: 'Active' | 'Inactive';
  devices: UserDevice[];
  mobileNo: string;
}

export interface UserDevice {
  deviceId: string;
  deviceType: string;
  allocatedOn: string;
  lastUsedOn: string;
}

export interface Provider {
  id: string;
  name: string;
  age: number;
  deviceTypes: string[];
  usersCount: number;
  mobileNo: string;
}

export interface Reading {
  id: string;
  patientId: string;
  systolic: number;
  diastolic: number;
  bloodGlucose: number;
  pulse: number;
  timestamp: string;
}

export interface Patient extends User {
  doctorId: string;
  deviceId?: string;
  medicalHistory?: string;
  currentMedications?: string[];
  targetBP?: {
    systolic: number;
    diastolic: number;
  };
  targetBG?: number;
}

export interface Doctor extends Provider {
  licenseNumber: string;
  specialty: string;
  biography?: string;
  availability?: {
    [key: string]: string[];
  };
}

// Add this interface for individual devices
export interface Device {
  id: string;
  deviceTypeId: string;  // References the parent DeviceType.id
  yearOfManufacturing: string;
  validity: string;
  status: 'active' | 'inactive';
  allocation: 'allocated' | 'not allocated';
  allocatedTo?: string;  // User ID if allocated
  lastUsedOn?: string;   // Last usage timestamp
}

// Add this new interface for device usage tracking
export interface DeviceUsage {
  id: string;           // Unique identifier for the usage record
  userId: string;       // References User.id
  deviceId: string;     // References Device.id
  deviceType: string;   // References DeviceType.code
  usageDate: string;    // ISO date string (YYYY-MM-DD)
  usageTime: string;    // Time of usage (HH:MM)
  timestamp: string;    // Full ISO timestamp
  notes?: string;       // Optional notes about the usage
}

// Add this interface for aggregated usage statistics
export interface UsageStats {
  userId: string;
  deviceId: string;
  deviceType: string;
  totalUsages: number;
  lastUsed: string;
  usageByMonth: {
    [key: string]: number; // Format: "YYYY-MM": count
  };
  usageByDay: {
    [key: string]: number; // Format: "YYYY-MM-DD": count
  };
}
