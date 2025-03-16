import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DeviceUsage } from '../types/index';
import { deviceUsages as mockDeviceUsages } from '../data/mockData';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface UsageContextType {
  usageHistory: DeviceUsage[];
  addUsage: (deviceIds: string[], timestamp: string) => void;
  getUserDeviceUsage: (userId: string, deviceId: string) => DeviceUsage[];
  getAllUserUsage: (userId: string) => DeviceUsage[];
  getDeviceUsageByDate: (userId: string, date: string) => DeviceUsage[];
  getDeviceUsageData: (userId: string) => { date: string; count: number; devices: string[] }[];
  hasUsageForToday: (userId: string) => boolean;
  getFirstUsageDate: (userId: string) => string | null;
  getCurrentMonthUsageDays: (userId: string) => number;
}

const UsageContext = createContext<UsageContextType>({
  usageHistory: [],
  addUsage: () => {},
  getUserDeviceUsage: () => [],
  getAllUserUsage: () => [],
  getDeviceUsageByDate: () => [],
  getDeviceUsageData: () => [],
  hasUsageForToday: () => false,
  getFirstUsageDate: () => null,
  getCurrentMonthUsageDays: () => 0,
});

export const useUsage = () => useContext(UsageContext);

interface UsageProviderProps {
  children: ReactNode;
}

export const UsageProvider: React.FC<UsageProviderProps> = ({ children }) => {
  const { userId, userData } = useAuth();
  const [usageHistory, setUsageHistory] = useState<DeviceUsage[]>([]);
  
  // Load usage data from localStorage on mount
  useEffect(() => {
    const storedUsage = localStorage.getItem('deviceUsages');
    if (storedUsage) {
      try {
        const parsedUsage = JSON.parse(storedUsage);
        setUsageHistory(parsedUsage);
      } catch (error) {
        console.error('Error parsing usage data:', error);
        // Initialize with mock data if parsing fails
        setUsageHistory(mockDeviceUsages);
        localStorage.setItem('deviceUsages', JSON.stringify(mockDeviceUsages));
      }
    } else {
      // Initialize with mock data if not found
      setUsageHistory(mockDeviceUsages);
      localStorage.setItem('deviceUsages', JSON.stringify(mockDeviceUsages));
    }
  }, []);
  
  // Save usage data to localStorage whenever it changes
  useEffect(() => {
    if (usageHistory.length > 0) {
      localStorage.setItem('deviceUsages', JSON.stringify(usageHistory));
    }
  }, [usageHistory]);
  
  const addUsage = (deviceIds: string[], timestamp: string) => {
    if (!userId || !userData) return;
    
    const usageDate = timestamp.split('T')[0];
    const usageTime = timestamp.split('T')[1].substring(0, 5);
    
    // Get device types for the selected device IDs
    const newUsageEntries: DeviceUsage[] = deviceIds.map(deviceId => {
      const device = userData.devices.find(d => d.deviceId === deviceId);
      const deviceType = device ? device.deviceType : '';
      
      return {
        id: `USAGE_${userId}_${deviceId}_${Date.now()}`,
        userId,
        deviceId,
        deviceType,
        usageDate,
        usageTime,
        timestamp,
      };
    });
    
    setUsageHistory(prev => [...newUsageEntries, ...prev]);
    
    // Update device lastUsedOn in localStorage
    try {
      const devicesData = localStorage.getItem('devices');
      if (devicesData) {
        const devices = JSON.parse(devicesData);
        const updatedDevices = devices.map((device: any) => {
          if (deviceIds.includes(device.id)) {
            return {
              ...device,
              lastUsedOn: usageDate,
            };
          }
          return device;
        });
        
        localStorage.setItem('devices', JSON.stringify(updatedDevices));
      }
      
      // Also update the lastUsedOn in the user's devices
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const updatedUsers = users.map((user: any) => {
          if (user.id === userId) {
            const updatedDevices = user.devices.map((device: any) => {
              if (deviceIds.includes(device.deviceId)) {
                return {
                  ...device,
                  lastUsedOn: usageDate,
                };
              }
              return device;
            });
            
            return {
              ...user,
              devices: updatedDevices,
            };
          }
          return user;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
      
      toast.success(`Usage recorded for ${deviceIds.length} device(s)`);
    } catch (error) {
      console.error('Error updating device usage:', error);
      toast.error('Failed to update device usage');
    }
  };
  
  const getUserDeviceUsage = (userId: string, deviceId: string): DeviceUsage[] => {
    return usageHistory.filter(
      usage => usage.userId === userId && usage.deviceId === deviceId
    );
  };
  
  const getAllUserUsage = (userId: string): DeviceUsage[] => {
    return usageHistory.filter(usage => usage.userId === userId);
  };
  
  const getDeviceUsageByDate = (userId: string, date: string): DeviceUsage[] => {
    return usageHistory.filter(
      usage => usage.userId === userId && usage.usageDate === date
    );
  };
  
  const getDeviceUsageData = (userId: string) => {
    if (!userId) return [];
    
    // Get all usage records for this user
    const userUsage = usageHistory.filter(usage => usage.userId === userId);
    
    // Group by date and count unique devices used each day
    const usageByDate: Record<string, { count: number; devices: string[] }> = {};
    
    userUsage.forEach(usage => {
      if (!usageByDate[usage.usageDate]) {
        usageByDate[usage.usageDate] = { count: 0, devices: [] };
      }
      
      if (!usageByDate[usage.usageDate].devices.includes(usage.deviceId)) {
        usageByDate[usage.usageDate].devices.push(usage.deviceId);
        usageByDate[usage.usageDate].count = usageByDate[usage.usageDate].devices.length;
      }
    });
    
    // Convert to array format needed by heatmap
    return Object.entries(usageByDate).map(([date, data]) => ({
      date,
      count: data.count,
      devices: data.devices
    }));
  };
  
  const hasUsageForToday = (userId: string): boolean => {
    if (!userId) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return usageHistory.some(
      usage => usage.userId === userId && usage.usageDate === today
    );
  };
  
  const getFirstUsageDate = (userId: string): string | null => {
    if (!userId) return null;
    
    const userUsage = usageHistory.filter(usage => usage.userId === userId);
    if (userUsage.length === 0) return null;
    
    // Sort by date (oldest first)
    userUsage.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return userUsage[0].usageDate;
  };
  
  const getCurrentMonthUsageDays = (userId: string): number => {
    if (!userId) return 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get all usage records for this user
    const userUsage = usageHistory.filter(usage => {
      const usageDate = new Date(usage.timestamp);
      return (
        usage.userId === userId && 
        usageDate.getMonth() === currentMonth && 
        usageDate.getFullYear() === currentYear
      );
    });
    
    // Count unique days
    const uniqueDays = new Set<string>();
    userUsage.forEach(usage => {
      uniqueDays.add(usage.usageDate);
    });
    
    return uniqueDays.size;
  };
  
  return (
    <UsageContext.Provider
      value={{
        usageHistory,
        addUsage,
        getUserDeviceUsage,
        getAllUserUsage,
        getDeviceUsageByDate,
        getDeviceUsageData,
        hasUsageForToday,
        getFirstUsageDate,
        getCurrentMonthUsageDays,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
}; 