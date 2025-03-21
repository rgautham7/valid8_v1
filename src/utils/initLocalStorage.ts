// src/utils/initLocalStorage.ts
import { deviceTypes, providers, users, devices, migrateParametersToArray } from '../data/mockData';

/**
 * Initialize localStorage with mock data if it doesn't exist
 */
export const initLocalStorage = () => {
  console.log('Initializing localStorage with mock data...');
  
  // Initialize device types
  if (!localStorage.getItem('deviceTypes')) {
    console.log('Initializing deviceTypes in localStorage');
    localStorage.setItem('deviceTypes', JSON.stringify(deviceTypes));
  } else {
    // Migrate existing parameters to array format
    migrateParametersToArray();
  }
  
  // Initialize providers
  if (!localStorage.getItem('providers')) {
    console.log('Initializing providers in localStorage');
    localStorage.setItem('providers', JSON.stringify(providers));
  }
  
  // Initialize users
  if (!localStorage.getItem('users')) {
    console.log('Initializing users in localStorage');
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  // Initialize devices
  if (!localStorage.getItem('devices')) {
    console.log('Initializing devices in localStorage');
    localStorage.setItem('devices', JSON.stringify(devices));
  }
  
  console.log('localStorage initialization complete');
};

/**
 * Reset localStorage with mock data
 */
export const resetLocalStorage = () => {
  console.log('Resetting localStorage with mock data...');
  
  // Clear existing data
  localStorage.removeItem('deviceTypes');
  localStorage.removeItem('providers');
  localStorage.removeItem('users');
  localStorage.removeItem('devices');
  
  // Initialize with mock data
  initLocalStorage();
  
  console.log('localStorage reset complete');
};

/**
 * Verify localStorage data integrity
 * @returns Object with verification results
 */
export const verifyLocalStorageData = () => {
  console.log('Verifying localStorage data integrity...');
  
  const results = {
    deviceTypes: {
      exists: false,
      count: 0,
      valid: false
    },
    providers: {
      exists: false,
      count: 0,
      valid: false
    },
    users: {
      exists: false,
      count: 0,
      valid: false
    },
    devices: {
      exists: false,
      count: 0,
      valid: false
    }
  };
  
  // Check device types
  const deviceTypesData = localStorage.getItem('deviceTypes');
  if (deviceTypesData) {
    try {
      const parsedDeviceTypes = JSON.parse(deviceTypesData);
      results.deviceTypes.exists = true;
      results.deviceTypes.count = parsedDeviceTypes.length;
      results.deviceTypes.valid = Array.isArray(parsedDeviceTypes) && parsedDeviceTypes.length > 0;
    } catch (error) {
      console.error('Error parsing deviceTypes:', error);
    }
  }
  
  // Check providers
  const providersData = localStorage.getItem('providers');
  if (providersData) {
    try {
      const parsedProviders = JSON.parse(providersData);
      results.providers.exists = true;
      results.providers.count = parsedProviders.length;
      results.providers.valid = Array.isArray(parsedProviders) && parsedProviders.length > 0;
    } catch (error) {
      console.error('Error parsing providers:', error);
    }
  }
  
  // Check users
  const usersData = localStorage.getItem('users');
  if (usersData) {
    try {
      const parsedUsers = JSON.parse(usersData);
      results.users.exists = true;
      results.users.count = parsedUsers.length;
      results.users.valid = Array.isArray(parsedUsers) && parsedUsers.length > 0;
    } catch (error) {
      console.error('Error parsing users:', error);
    }
  }
  
  // Check devices
  const devicesData = localStorage.getItem('devices');
  if (devicesData) {
    try {
      const parsedDevices = JSON.parse(devicesData);
      results.devices.exists = true;
      results.devices.count = parsedDevices.length;
      results.devices.valid = Array.isArray(parsedDevices) && parsedDevices.length > 0;
    } catch (error) {
      console.error('Error parsing devices:', error);
    }
  }
  
  console.log('localStorage verification results:', results);
  
  // Initialize any missing data
  if (!results.deviceTypes.exists || !results.deviceTypes.valid) {
    localStorage.setItem('deviceTypes', JSON.stringify(deviceTypes));
    results.deviceTypes = { exists: true, count: deviceTypes.length, valid: true };
  }
  
  if (!results.providers.exists || !results.providers.valid) {
    localStorage.setItem('providers', JSON.stringify(providers));
    results.providers = { exists: true, count: providers.length, valid: true };
  }
  
  if (!results.users.exists || !results.users.valid) {
    localStorage.setItem('users', JSON.stringify(users));
    results.users = { exists: true, count: users.length, valid: true };
  }
  
  if (!results.devices.exists || !results.devices.valid) {
    localStorage.setItem('devices', JSON.stringify(devices));
    results.devices = { exists: true, count: devices.length, valid: true };
  }
  
  return results;
};