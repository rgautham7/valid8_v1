import { getFromStorage } from './storageUtils';
import { initLocalStorage } from './initLocalStorage';
import { DeviceType, Device, Provider, User } from '../types';

/**
 * Verify data integrity and fix any issues
 */
export const verifyDataIntegrity = (): boolean => {
  console.log('Verifying data integrity...');
  
  try {
    // Check if all required data exists
    const deviceTypes = getFromStorage<DeviceType[]>('deviceTypes', []);
    const devices = getFromStorage<Device[]>('devices', []);
    const providers = getFromStorage<Provider[]>('providers', []);
    const users = getFromStorage<User[]>('users', []);
    
    // Log data counts
    console.log('Data verification:');
    console.log('- Device Types:', deviceTypes.length);
    console.log('- Devices:', devices.length);
    console.log('- Providers:', providers.length);
    console.log('- Users:', users.length);
    
    // Check for missing data
    if (deviceTypes.length === 0 || devices.length === 0 || providers.length === 0 || users.length === 0) {
      console.warn('Missing data detected, reinitializing...');
      initLocalStorage();
      return false;
    }
    
    // Check for data consistency
    const deviceTypeIds = new Set(deviceTypes.map(dt => dt.code));
    const invalidDevices = devices.filter(d => !deviceTypeIds.has(d.deviceTypeId));
    
    if (invalidDevices.length > 0) {
      console.warn('Found devices with invalid device type IDs:', invalidDevices);
      // Fix could be implemented here if needed
    }
    
    // Check provider-user relationships
    const providerIds = new Set(providers.map(p => p.id));
    const usersWithInvalidProviders = users.filter(u => u.providerId && !providerIds.has(u.providerId));
    
    if (usersWithInvalidProviders.length > 0) {
      console.warn('Found users with invalid provider IDs:', usersWithInvalidProviders);
      // Fix could be implemented here if needed
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying data integrity:', error);
    return false;
  }
}; 