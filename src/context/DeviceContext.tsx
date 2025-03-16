import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Device, DeviceType } from '../types/index';
import { useDeviceTypes } from './DeviceTypeContext';

interface DeviceContextType {
  devices: Device[];
  addDevice: (device: Device) => void;
  addDevices: (devices: Device[]) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  getDevicesByType: (deviceTypeId: string) => Device[];
  loading: boolean;
  error: string | null;
}

export const DeviceContext = createContext<DeviceContextType>({
  devices: [],
  addDevice: () => {},
  addDevices: () => {},
  updateDevice: () => {},
  deleteDevice: () => {},
  getDevicesByType: () => [],
  loading: false,
  error: null,
});



// export const useDevices = () => useContext(DeviceContext);
// function useDevices() {
//   return useContext(DeviceContext);
// }

// export { useDevices };

interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { deviceTypes } = useDeviceTypes();

  // Load initial devices from localStorage
  useEffect(() => {
    try {
      setLoading(true);
      const storedDevices = localStorage.getItem('devices');
      
      if (storedDevices) {
        setDevices(JSON.parse(storedDevices));
      } else {
        // Initialize with empty array if no devices in localStorage
        setDevices([]);
        localStorage.setItem('devices', JSON.stringify([]));
      }
    } catch (err) {
      setError('Failed to load devices');
      console.error('Error loading devices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save devices to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('devices', JSON.stringify(devices));
    } catch (err) {
      setError('Failed to save devices');
      console.error('Error saving devices:', err);
    }
  }, [devices]);

  // Add a single device
  const addDevice = (device: Device) => {
    try {
      // Check if device with this ID already exists
      if (devices.some(d => d.id === device.id)) {
        throw new Error(`Device with ID ${device.id} already exists`);
      }
      
      // Check if the referenced device type exists
      if (!deviceTypes.some(dt => dt.id === device.deviceTypeId)) {
        throw new Error(`Device type with ID ${device.deviceTypeId} does not exist`);
      }
      
      setDevices(prev => [...prev, device]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add device');
      console.error('Error adding device:', err);
      throw err;
    }
  };

  // Add multiple devices at once
  const addDevices = (newDevices: Device[]) => {
    try {
      // Check for duplicate IDs within the new devices
      const newDeviceIds = new Set(newDevices.map(d => d.id));
      if (newDeviceIds.size !== newDevices.length) {
        throw new Error('Duplicate device IDs in the new devices');
      }
      
      // Check for existing IDs in the current devices
      const existingIds = new Set(devices.map(d => d.id));
      const duplicates = newDevices.filter(d => existingIds.has(d.id));
      if (duplicates.length > 0) {
        throw new Error(`Devices with IDs ${duplicates.map(d => d.id).join(', ')} already exist`);
      }
      
      // Check if all referenced device types exist
      const deviceTypeIds = new Set(deviceTypes.map(dt => dt.id));
      const invalidDeviceTypes = newDevices.filter(d => !deviceTypeIds.has(d.deviceTypeId));
      if (invalidDeviceTypes.length > 0) {
        throw new Error(`Invalid device type IDs: ${invalidDeviceTypes.map(d => d.deviceTypeId).join(', ')}`);
      }
      
      setDevices(prev => [...prev, ...newDevices]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add devices');
      console.error('Error adding devices:', err);
      throw err;
    }
  };

  // Update an existing device
  const updateDevice = (id: string, updatedDevice: Partial<Device>) => {
    try {
      // Check if device exists
      if (!devices.some(d => d.id === id)) {
        throw new Error(`Device with ID ${id} does not exist`);
      }
      
      setDevices(prev => 
        prev.map(device => 
          device.id === id 
            ? { ...device, ...updatedDevice } 
            : device
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device');
      console.error('Error updating device:', err);
      throw err;
    }
  };

  // Delete a device
  const deleteDevice = (id: string) => {
    try {
      // Check if device exists
      if (!devices.some(d => d.id === id)) {
        throw new Error(`Device with ID ${id} does not exist`);
      }
      
      setDevices(prev => prev.filter(device => device.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
      console.error('Error deleting device:', err);
      throw err;
    }
  };

  // Get devices by device type
  const getDevicesByType = (deviceTypeId: string) => {
    return devices.filter(device => device.deviceTypeId === deviceTypeId);
  };

  const value = {
    devices,
    addDevice,
    addDevices,
    updateDevice,
    deleteDevice,
    getDevicesByType,
    loading,
    error,
  };

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};

