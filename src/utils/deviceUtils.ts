import { Device, DeviceType, User, UserDevice } from '../types';
import { getFromStorage, saveToStorage } from './storageUtils';

/**
 * Generates a unique device ID based on the device type code and existing devices
 * @param deviceType The device type
 * @param existingDevices Existing devices of the same type
 * @returns A unique device ID
 */
export const generateDeviceId = (deviceType: DeviceType, existingDevices: Device[]): string => {
  // Get the prefix from the device type code (e.g., "glucose-regulator" -> "GR")
  const prefix = deviceType.code
    .split('-')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  // Find the highest number for this prefix
  const existingIds = existingDevices
    .filter(device => device.deviceTypeId === deviceType.id)
    .map(device => device.id)
    .filter(id => id.startsWith(prefix))
    .map(id => {
      const match = id.match(new RegExp(`^${prefix}(\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    });
  
  const highestNumber = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  const nextNumber = highestNumber + 1;
  
  // Format the number with leading zeros (e.g., "GR001")
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

/**
 * Validates a device ID format
 * @param deviceId The device ID to validate
 * @param deviceType The device type
 * @returns True if the device ID is valid
 */
export const isValidDeviceId = (deviceId: string, deviceType: DeviceType): boolean => {
  const prefix = deviceType.code
    .split('-')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  const regex = new RegExp(`^${prefix}\\d{3,}$`);
  return regex.test(deviceId);
};

/**
 * Allocate a device to a user
 */
export const allocateDeviceToUser = (deviceId: string, userId: string): boolean => {
  try {
    // Get device
    const devices = getFromStorage<Device[]>('devices', []);
    const device = devices.find(d => d.id === deviceId);
    
    if (!device) {
      console.error('Device not found:', deviceId);
      return false;
    }
    
    if (device.allocation === 'allocated') {
      console.error('Device is already allocated:', deviceId);
      return false;
    }
    
    // Get user
    const users = getFromStorage<User[]>('users', []);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      console.error('User not found:', userId);
      return false;
    }
    
    // Update device
    const today = new Date().toISOString().split('T')[0];
    const updatedDevice: Device = {
      ...device,
      allocation: 'allocated',
      allocatedTo: userId,
      lastUsedOn: today
    };
    
    // Update user's devices
    const updatedUser: User = {
      ...user,
      devices: [
        ...user.devices,
        {
          deviceId: deviceId,
          deviceType: device.deviceTypeId,
          allocatedOn: today,
          lastUsedOn: today
        }
      ]
    };
    
    // Update localStorage
    const updatedDevices = devices.map(d => d.id === deviceId ? updatedDevice : d);
    const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
    
    saveToStorage('devices', updatedDevices);
    saveToStorage('users', updatedUsers);
    
    return true;
  } catch (error) {
    console.error('Error allocating device:', error);
    return false;
  }
};

/**
 * Deallocate a device
 */
export const deallocateDevice = (deviceId: string): boolean => {
  try {
    // Get device
    const devices = getFromStorage<Device[]>('devices', []);
    const device = devices.find(d => d.id === deviceId);
    
    if (!device) {
      console.error('Device not found:', deviceId);
      return false;
    }
    
    if (device.allocation !== 'allocated' || !device.allocatedTo) {
      console.error('Device is not allocated:', deviceId);
      return false;
    }
    
    // Get user
    const users = getFromStorage<User[]>('users', []);
    const user = users.find(u => u.id === device.allocatedTo);
    
    if (!user) {
      console.error('User not found:', device.allocatedTo);
      // Still deallocate the device even if user not found
    } else {
      // Update user's devices
      const updatedUser: User = {
        ...user,
        devices: user.devices.filter(d => d.deviceId !== deviceId)
      };
      
      // Update users in localStorage
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      saveToStorage('users', updatedUsers);
    }
    
    // Update device
    const updatedDevice: Device = {
      ...device,
      allocation: 'not allocated',
      allocatedTo: undefined
    };
    
    // Update devices in localStorage
    const updatedDevices = devices.map(d => d.id === deviceId ? updatedDevice : d);
    saveToStorage('devices', updatedDevices);
    
    return true;
  } catch (error) {
    console.error('Error deallocating device:', error);
    return false;
  }
};

/**
 * Get all devices for a provider
 * @param providerId The ID of the provider
 * @returns An array of devices
 */
export const getProviderDevices = (providerId: string | null): Device[] => {
  if (!providerId) return [];
  
  try {
    const storedDevices = localStorage.getItem('devices');
    if (!storedDevices) return [];
    
    const devices: Device[] = JSON.parse(storedDevices);
    // In a real app, we would filter by provider ID
    // For now, we'll return all devices
    return devices;
  } catch (error) {
    console.error('Error getting provider devices:', error);
    return [];
  }
};

/**
 * Get devices allocated to a specific user
 * @param userId The ID of the user
 * @returns An array of devices
 */
export const getUserDevices = (userId: string): Device[] => {
  try {
    // Get the user
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) return [];
    
    const users: User[] = JSON.parse(storedUsers);
    const user = users.find(u => u.id === userId);
    
    if (!user) return [];
    
    // Get all devices
    const storedDevices = localStorage.getItem('devices');
    if (!storedDevices) return [];
    
    const devices: Device[] = JSON.parse(storedDevices);
    
    // Filter devices allocated to this user
    const userDeviceIds = user.devices.map(d => d.deviceId);
    return devices.filter(d => userDeviceIds.includes(d.id));
  } catch (error) {
    console.error('Error getting user devices:', error);
    return [];
  }
};

/**
 * Check if a device is allocated
 * @param deviceId The ID of the device
 * @returns True if the device is allocated, false otherwise
 */
export const isDeviceAllocated = (deviceId: string): boolean => {
  try {
    const storedDevices = localStorage.getItem('devices');
    if (!storedDevices) return false;
    
    const devices: Device[] = JSON.parse(storedDevices);
    const device = devices.find(d => d.id === deviceId);
    
    return device ? device.allocation === 'allocated' : false;
  } catch (error) {
    console.error('Error checking device allocation:', error);
    return false;
  }
};

/**
 * Get the user who has a device allocated
 * @param deviceId The ID of the device
 * @returns The user who has the device allocated, or null if not allocated
 */
export const getAllocatedUser = (deviceId: string): User | null => {
  try {
    const storedDevices = localStorage.getItem('devices');
    if (!storedDevices) return null;
    
    const devices: Device[] = JSON.parse(storedDevices);
    const device = devices.find(d => d.id === deviceId);
    
    if (!device || device.allocation !== 'allocated' || !device.allocatedTo) {
      return null;
    }
    
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) return null;
    
    const users: User[] = JSON.parse(storedUsers);
    return users.find(u => u.id === device.allocatedTo) || null;
  } catch (error) {
    console.error('Error getting allocated user:', error);
    return null;
  }
};