// Define base interfaces
export interface DeviceType {
  id: string;
  name: string;
  code: string;
  image?: string;
  parameters?: string[];
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
  frequency?: string;
  email?: string;
  registeredOn?: string;
  lastActiveOn?: string;
  remarks?: string;
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
  hospital: string;
  licenseNumber: string;
  specialistIn: string;
  deviceTypes: string[];
  usersCount: number;
  mobileNo: string;
  allocatedDevices?: string[];
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

export interface Device {
  id: string;
  deviceTypeId: string;
  yearOfManufacturing: string;
  validity: string;
  status: 'active' | 'inactive';
  allocation: 'allocated' | 'not allocated';
  allocatedTo?: string;
  lastUsedOn?: string;
  providerAllocation?: string;
}

export interface DeviceUsage {
  id: string;
  userId: string;
  deviceId: string;
  deviceType: string;
  usageDate: string;
  usageTime: string;
  timestamp: string;
  notes?: string;
}

export interface UsageStats {
  userId: string;
  deviceId: string;
  deviceType: string;
  totalUsages: number;
  lastUsed: string;
  usageByMonth: {
    [key: string]: number;
  };
  usageByDay: {
    [key: string]: number;
  };
}
