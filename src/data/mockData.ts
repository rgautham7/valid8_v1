import { DeviceType, Provider, User, Device, DeviceUsage } from '../types/index';

export const deviceTypes: DeviceType[] = [
  { 
    id: 'DT001', 
    name: 'Glucose Regulator', 
    code: 'glucose-regulator',
    countryOfOrigin: 'India',
    manufacturer: 'ABC Medical',
    parameters: 'glucose level, insulin rate',
    yearOfManufacturing: '2023',
    validity: '2028-05-15',
    remarks: 'Latest model with Bluetooth connectivity',
    image: ''
  },
  { 
    id: 'DT002', 
    name: 'Pulse Regulator', 
    code: 'pulse-regulator',
    countryOfOrigin: 'USA',
    manufacturer: 'MedTech Inc',
    parameters: 'pulse rate, oxygen level',
    yearOfManufacturing: '2023',
    validity: '2028-03-20',
    remarks: 'Advanced model with mobile app integration',
    image: ''
  },
  { 
    id: 'DT003', 
    name: 'Pressure Regulator', 
    code: 'pressure-regulator',
    countryOfOrigin: 'Germany',
    manufacturer: 'PressureTech GmbH',
    parameters: 'systolic, diastolic',
    yearOfManufacturing: '2023',
    validity: '2028-01-10',
    remarks: 'Includes cloud data storage',
    image: ''
  }
];

export const providers: Provider[] = [
  {
    id: 'PRV_A',
    name: 'Dr. Alice Anderson',
    age: 42,
    deviceTypes: ['glucose-regulator'],
    usersCount: 2,
    mobileNo: '9876543210'
  },
  {
    id: 'PRV_B',
    name: 'Dr. Bob Brown',
    age: 45,
    deviceTypes: ['glucose-regulator', 'pulse-regulator'],
    usersCount: 3,
    mobileNo: '9876543211'
  },
  {
    id: 'PRV_C',
    name: 'Dr. Carol Chen',
    age: 38,
    deviceTypes: ['glucose-regulator', 'pressure-regulator'],
    usersCount: 2,
    mobileNo: '9876543212'
  },
  {
    id: 'PRV_D',
    name: 'Dr. David Davis',
    age: 50,
    deviceTypes: ['pulse-regulator', 'pressure-regulator'],
    usersCount: 2,
    mobileNo: '9876543213'
  },
  {
    id: 'PRV_E',
    name: 'Dr. Emma Evans',
    age: 41,
    deviceTypes: ['pressure-regulator'],
    usersCount: 1,
    mobileNo: '9876543214'
  }
];

export const users: User[] = [
  // Dr. Alice Anderson's users (2)
  {
    id: 'USR_A1',
    name: 'Adam Smith',
    age: 45,
    gender: 'M',
    providerId: 'PRV_A',
    activity: 'Active',
    mobileNo: '9876500001',
    devices: [
      {
        deviceId: 'GR_001',
        deviceType: 'glucose-regulator',
        allocatedOn: '2023-12-15',
        lastUsedOn: '2024-03-14'  
      }
    ]
  },
  {
    id: 'USR_A2',
    name: 'Anna White',
    age: 52,
    gender: 'F',
    providerId: 'PRV_A',
    activity: 'Active',
    mobileNo: '9876500002',
    devices: [
      {
        deviceId: 'GR_002',
        deviceType: 'glucose-regulator',
        allocatedOn: '2023-12-16',
        lastUsedOn: '2024-03-14'
      }
    ]
  },

  // Dr. Bob Brown's users (3)
  {
    id: 'USR_B1',
    name: 'Bill Johnson',
    age: 48,
    gender: 'M',
    providerId: 'PRV_B',
    activity: 'Active',
    mobileNo: '9876500003',
    devices: [
      {
        deviceId: 'GR_003',
        deviceType: 'glucose-regulator',
        allocatedOn: '2023-12-17',
        lastUsedOn: '2024-03-14'
      },
      {
        deviceId: 'PR_001',
        deviceType: 'pulse-regulator',
        allocatedOn: '2023-12-17',
        lastUsedOn: '2024-03-14'
      }
    ]
  },
  {
    id: 'USR_B2',
    name: 'Barbara Lee',
    age: 55,
    gender: 'F',
    providerId: 'PRV_B',
    activity: 'Active',
    mobileNo: '9876500004',
    devices: [
      {
        deviceId: 'GR_004',
        deviceType: 'glucose-regulator',
        allocatedOn: '2023-12-18',
        lastUsedOn: '2024-03-14'
      }
    ]
  },
  {
    id: 'USR_B3',
    name: 'Benjamin Clark',
    age: 61,
    gender: 'M',
    providerId: 'PRV_B',
    activity: 'Inactive',
    mobileNo: '9876500005',
    devices: [
      {
        deviceId: 'PR_002',
        deviceType: 'pulse-regulator',
        allocatedOn: '2023-12-19',
        lastUsedOn: '2024-03-10'
      }
    ]
  },

  // Dr. Carol Chen's users (2)
  {
    id: 'USR_C1',
    name: 'Catherine Wilson',
    age: 49,
    gender: 'F',
    providerId: 'PRV_C',
    activity: 'Active',
    mobileNo: '9876500006',
    devices: [
      {
        deviceId: 'GR_005',
        deviceType: 'glucose-regulator',
        allocatedOn: '2023-12-20',
        lastUsedOn: '2024-03-14'
      },
      {
        deviceId: 'PSR_001',
        deviceType: 'pressure-regulator',
        allocatedOn: '2023-12-20',
        lastUsedOn: '2024-03-14'
      }
    ]
  },
  {
    id: 'USR_C2',
    name: 'Charles Martin',
    age: 53,
    gender: 'M',
    providerId: 'PRV_C',
    activity: 'Active',
    mobileNo: '9876500007',
    devices: [
      {
        deviceId: 'PSR_002',
        deviceType: 'pressure-regulator',
        allocatedOn: '2023-12-21',
        lastUsedOn: '2024-03-13'
      }
    ]
  },

  // Dr. David Davis's users (2)
  {
    id: 'USR_D1',
    name: 'David Martinez',
    age: 58,
    gender: 'M',
    providerId: 'PRV_D',
    activity: 'Active',
    mobileNo: '9876500008',
    devices: [
      {
        deviceId: 'PR_003',
        deviceType: 'pulse-regulator',
        allocatedOn: '2023-12-21',
        lastUsedOn: '2024-03-14'
      }
    ]
  },
  {
    id: 'USR_D2',
    name: 'Diana Taylor',
    age: 46,
    gender: 'F',
    providerId: 'PRV_D',
    activity: 'Active',
    mobileNo: '9876500009',
    devices: [
      {
        deviceId: 'PR_004',
        deviceType: 'pulse-regulator',
        allocatedOn: '2023-12-22',
        lastUsedOn: '2024-03-14'
      },
      {
        deviceId: 'PSR_003',
        deviceType: 'pressure-regulator',
        allocatedOn: '2023-12-22',
        lastUsedOn: '2024-03-12'
      }
    ]
  },

  // Dr. Emma Evans's users (1)
  {
    id: 'USR_E1',
    name: 'Emily Parker',
    age: 42,
    gender: 'F',
    providerId: 'PRV_E',
    activity: 'Active',
    mobileNo: '9876500010',
    devices: [
      {
        deviceId: 'PSR_004',
        deviceType: 'pressure-regulator',
        allocatedOn: '2023-12-23',
        lastUsedOn: '2024-03-13'
      }
    ]
  }
];

export const devices: Device[] = [
  // Glucose Regulators
  {
    id: 'GR_001',
    deviceTypeId: 'DT001',
    yearOfManufacturing: '2023-05-10',
    validity: '2028-05-10',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_A1',
    lastUsedOn: '2024-03-14'
  },
  {
    id: 'GR_002',
    deviceTypeId: 'DT001',
    yearOfManufacturing: '2023-05-15',
    validity: '2028-05-15',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_A2',
    lastUsedOn: '2024-03-14'
  },
  {
    id: 'GR_003',
    deviceTypeId: 'DT001',
    yearOfManufacturing: '2023-06-01',
    validity: '2028-06-01',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_B1',
    lastUsedOn: '2024-03-14'
  },
  {
    id: 'GR_004',
    deviceTypeId: 'DT001',
    yearOfManufacturing: '2023-06-10',
    validity: '2028-06-10',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_B2',
    lastUsedOn: '2024-03-14'
  },
  {
    id: 'GR_005',
    deviceTypeId: 'DT001',
    yearOfManufacturing: '2023-06-15',
    validity: '2028-06-15',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_C1',
    lastUsedOn: '2024-03-14'
  },
  {
    id: 'GR_006',
    deviceTypeId: 'DT001',
    yearOfManufacturing: '2023-07-01',
    validity: '2028-07-01',
    status: 'inactive',
    allocation: 'not allocated',
    allocatedTo: undefined,
    lastUsedOn: undefined
  },
  {
    id: 'GR_007',
    deviceTypeId: 'DT001',
    yearOfManufacturing: '2023-07-10',
    validity: '2028-07-10',
    status: 'inactive',
    allocation: 'not allocated',
    allocatedTo: undefined,
    lastUsedOn: undefined
  },

  // Pulse Regulators
  {
    id: 'PR_001',
    deviceTypeId: 'DT002',
    yearOfManufacturing: '2023-03-05',
    validity: '2028-03-05',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_B1',
    lastUsedOn: '2024-03-14'
  },
  {
    id: 'PR_002',
    deviceTypeId: 'DT002',
    yearOfManufacturing: '2023-03-10',
    validity: '2028-03-10',
    status: 'inactive',
    allocation: 'allocated',
    allocatedTo: 'USR_B3',
    lastUsedOn: '2024-03-10'
  },
  {
    id: 'PR_003',
    deviceTypeId: 'DT002',
    yearOfManufacturing: '2023-03-15',
    validity: '2028-03-15',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_D1',
    lastUsedOn: '2024-03-14'
  },
  {
    id: 'PR_004',
    deviceTypeId: 'DT002',
    yearOfManufacturing: '2023-03-20',
    validity: '2028-03-20',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_D2',
    lastUsedOn: '2024-03-14'
  },
  {
    id: 'PR_005',
    deviceTypeId: 'DT002',
    yearOfManufacturing: '2023-04-01',
    validity: '2028-04-01',
    status: 'inactive',
    allocation: 'not allocated',
    allocatedTo: undefined,
    lastUsedOn: undefined
  },

  // Pressure Regulators
  {
    id: 'PSR_001',
    deviceTypeId: 'DT003',
    yearOfManufacturing: '2023-01-05',
    validity: '2028-01-05',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_C1',
    lastUsedOn: '2024-03-14'
  },
  {
    id: 'PSR_002',
    deviceTypeId: 'DT003',
    yearOfManufacturing: '2023-01-10',
    validity: '2028-01-10',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_C2',
    lastUsedOn: '2024-03-13'
  },
  {
    id: 'PSR_003',
    deviceTypeId: 'DT003',
    yearOfManufacturing: '2023-01-15',
    validity: '2028-01-15',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_D2',
    lastUsedOn: '2024-03-12'
  },
  {
    id: 'PSR_004',
    deviceTypeId: 'DT003',
    yearOfManufacturing: '2023-01-20',
    validity: '2028-01-20',
    status: 'active',
    allocation: 'allocated',
    allocatedTo: 'USR_E1',
    lastUsedOn: '2024-03-13'
  },
  {
    id: 'PSR_005',
    deviceTypeId: 'DT003',
    yearOfManufacturing: '2023-02-01',
    validity: '2028-02-01',
    status: 'inactive',
    allocation: 'not allocated',
    allocatedTo: undefined,
    lastUsedOn: undefined
  },
  {
    id: 'PSR_006',
    deviceTypeId: 'DT003',
    yearOfManufacturing: '2023-02-10',
    validity: '2028-02-10',
    status: 'inactive',
    allocation: 'not allocated',
    allocatedTo: undefined,
    lastUsedOn: undefined
  }
];

// Generate usage history for the past 60 days (2 months) only
const generateUsageHistory = (userId: string, devices: { deviceId: string, deviceType: string, allocatedOn: string }[]): DeviceUsage[] => {
  const usageHistory: DeviceUsage[] = [];
  const now = new Date();
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  // For each device, generate some random usage data
  devices.forEach(device => {
    // Get allocation date to ensure we don't generate usage before allocation
    const allocationDate = new Date(device.allocatedOn);
    // Use the later of allocation date or two months ago as our start date
    const startDate = allocationDate > twoMonthsAgo ? allocationDate : twoMonthsAgo;
    
    // Calculate days between start date and now
    const daysBetween = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysBetween <= 0) return; // Skip if device was allocated today or in the future
    
    // Generate between 10-20 usage records in the valid date range
    const usageCount = Math.min(Math.floor(Math.random() * 10) + 10, daysBetween);
    
    // Create an array of random days within the range (no duplicates)
    const usageDays = new Set<number>();
    while (usageDays.size < usageCount) {
      usageDays.add(Math.floor(Math.random() * daysBetween));
    }
    
    // Convert to array and sort
    const sortedUsageDays = Array.from(usageDays).sort((a, b) => a - b);
    
    // Create usage records for each selected day
    sortedUsageDays.forEach((daysAgo, index) => {
      const usageDate = new Date(now);
      usageDate.setDate(usageDate.getDate() - daysAgo);
      
      // Random time between 6am and 10pm
      const hours = Math.floor(Math.random() * 16) + 6;
      const minutes = Math.floor(Math.random() * 60);
      usageDate.setHours(hours, minutes, 0, 0);
      
      // Format date and time strings
      const dateString = usageDate.toISOString().split('T')[0];
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      usageHistory.push({
        id: `USAGE_${userId}_${device.deviceId}_${dateString}_${index}`,
        userId,
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        usageDate: dateString,
        usageTime: timeString,
        timestamp: usageDate.toISOString(),
        notes: index % 5 === 0 ? 'Regular check' : undefined
      });
    });
  });
  
  // Sort by timestamp in descending order (newest first)
  return usageHistory.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// Generate usage history for all users
export const deviceUsages: DeviceUsage[] = users.flatMap(user => 
  generateUsageHistory(user.id, user.devices)
);

// Generate usage statistics
export const generateUsageStats = () => {
  const stats: Record<string, any> = {};
  
  deviceUsages.forEach(usage => {
    const key = `${usage.userId}_${usage.deviceId}`;
    const monthKey = usage.usageDate.substring(0, 7); // YYYY-MM
    const dayKey = usage.usageDate; // YYYY-MM-DD
    
    if (!stats[key]) {
      stats[key] = {
        userId: usage.userId,
        deviceId: usage.deviceId,
        deviceType: usage.deviceType,
        totalUsages: 0,
        lastUsed: usage.timestamp,
        usageByMonth: {},
        usageByDay: {}
      };
    }
    
    // Update total count
    stats[key].totalUsages++;
    
    // Update last used if this usage is more recent
    if (new Date(usage.timestamp) > new Date(stats[key].lastUsed)) {
      stats[key].lastUsed = usage.timestamp;
    }
    
    // Update monthly count
    if (!stats[key].usageByMonth[monthKey]) {
      stats[key].usageByMonth[monthKey] = 0;
    }
    stats[key].usageByMonth[monthKey]++;
    
    // Update daily count
    if (!stats[key].usageByDay[dayKey]) {
      stats[key].usageByDay[dayKey] = 0;
    }
    stats[key].usageByDay[dayKey]++;
  });
  
  return Object.values(stats);
};

export const usageStats = generateUsageStats();

// Add this function to initialize or update localStorage with the new mock data
function updateLocalStorageWithMobileNumbers() {
  // First, check if localStorage already has data
  const existingProviders = localStorage.getItem('providers');
  const existingUsers = localStorage.getItem('users');
  
  // Update providers with mobile numbers
  if (existingProviders) {
    try {
      const providers = JSON.parse(existingProviders);
      // Add mobile numbers to existing providers
      const updatedProviders = providers.map((provider: Provider, index: number) => ({
        ...provider,
        mobileNo: provider.mobileNo || `987654321${index}` // Add mobile if not exists
      }));
      localStorage.setItem('providers', JSON.stringify(updatedProviders));
    } catch (error) {
      console.error('Error updating providers:', error);
      // If error, replace with new mock data
      localStorage.setItem('providers', JSON.stringify(providers));
    }
  } else {
    // If no existing data, use mock data
    localStorage.setItem('providers', JSON.stringify(providers));
  }
  
  // Update users with mobile numbers
  if (existingUsers) {
    try {
      const users = JSON.parse(existingUsers);
      // Add mobile numbers to existing users
      const updatedUsers = users.map((user: User, index: number) => ({
        ...user,
        mobileNo: user.mobileNo || `987650000${index + 1}` // Add mobile if not exists
      }));
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error updating users:', error);
      // If error, replace with new mock data
      localStorage.setItem('users', JSON.stringify(users));
    }
  } else {
    // If no existing data, use mock data
    localStorage.setItem('users', JSON.stringify(users));
  }
} 