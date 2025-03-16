import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUsage } from '../../context/UsageContext';
import UserNavbar from '../../components/layout/UserNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Smartphone, Calendar, Clock, Plus, ArrowLeft } from 'lucide-react';
import AddUsageModal from '../../components/user/AddUsageModal';

const DeviceTypeManagement: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { usageHistory, addUsage, getUserDeviceUsage } = useUsage();
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState<Record<string, any>>({});
  const [deviceStats, setDeviceStats] = useState<Record<string, { total: number; thisMonth: number }>>({});

  useEffect(() => {
    // Load device types from localStorage
    try {
      const deviceTypesData = localStorage.getItem('deviceTypes');
      if (deviceTypesData) {
        const types = JSON.parse(deviceTypesData);
        const typesMap: Record<string, any> = {};
        types.forEach((type: any) => {
          typesMap[type.code] = type;
        });
        setDeviceTypes(typesMap);
      }
    } catch (error) {
      console.error('Error loading device types:', error);
    }
  }, []);

  // Calculate usage statistics for each device
  useEffect(() => {
    if (userData) {
      const stats: Record<string, { total: number; thisMonth: number }> = {};
      
      userData.devices.forEach(device => {
        const deviceUsage = getUserDeviceUsage(userData.id, device.deviceId);
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Count unique days, not just usage records
        const allDays = new Set<string>();
        const thisMonthDays = new Set<string>();
        
        deviceUsage.forEach(usage => {
          allDays.add(usage.usageDate);
          
          const usageDate = new Date(usage.timestamp);
          if (usageDate.getMonth() === currentMonth && usageDate.getFullYear() === currentYear) {
            thisMonthDays.add(usage.usageDate);
          }
        });
        
        stats[device.deviceId] = {
          total: allDays.size,
          thisMonth: thisMonthDays.size
        };
      });
      
      setDeviceStats(stats);
    }
  }, [userData, usageHistory, getUserDeviceUsage]);

  const handleAddUsage = (deviceIds: string[], timestamp: string) => {
    if (!userData) return;
    addUsage(deviceIds, timestamp);
    
    // Recalculate stats after adding usage
    const stats: Record<string, { total: number; thisMonth: number }> = {};
    
    userData.devices.forEach(device => {
      const deviceUsage = getUserDeviceUsage(userData.id, device.deviceId);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Count unique days, not just usage records
      const allDays = new Set<string>();
      const thisMonthDays = new Set<string>();
      
      deviceUsage.forEach(usage => {
        allDays.add(usage.usageDate);
        
        const usageDate = new Date(usage.timestamp);
        if (usageDate.getMonth() === currentMonth && usageDate.getFullYear() === currentYear) {
          thisMonthDays.add(usage.usageDate);
        }
      });
      
      stats[device.deviceId] = {
        total: allDays.size,
        thisMonth: thisMonthDays.size
      };
    });
    
    setDeviceStats(stats);
  };

  // Get last used date for a device
  const getLastUsedDate = (deviceId: string) => {
    if (!userData) return 'Never';
    
    const device = userData.devices.find(d => d.deviceId === deviceId);
    if (!device || !device.lastUsedOn) return 'Never';
    
    return new Date(device.lastUsedOn).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get first used date for a device
  const getFirstUsedDate = (deviceId: string) => {
    if (!userData) return 'N/A';
    
    const deviceUsage = getUserDeviceUsage(userData.id, deviceId);
    if (deviceUsage.length === 0) return 'N/A';
    
    // Sort by date (oldest first)
    deviceUsage.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return new Date(deviceUsage[0].timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      
      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/user/dashboard')}
            className="p-2 mr-2 text-gray-500 bg-white rounded-full shadow-sm hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">My Devices</h1>
        </div>
        
        {/* Action button */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowUsageModal(true)}
            className="w-full py-6 text-lg font-medium md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Today's Usage
          </Button>
        </div>
        
        {/* Devices list */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userData.devices.map(device => {
            const deviceType = deviceTypes[device.deviceType];
            const stats = deviceStats[device.deviceId] || { total: 0, thisMonth: 0 };
            
            return (
              <Card 
                key={device.deviceId} 
                className="overflow-hidden transition-shadow cursor-pointer hover:shadow-md"
                onClick={() => navigate(`/user/devices/${device.deviceId}`)}
              >
                <CardHeader className="border-b border-blue-100 bg-blue-50">
                  <CardTitle className="flex items-center text-lg text-blue-900">
                    <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                    {deviceType?.name || device.deviceType}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-500">Device ID</div>
                      <div className="font-medium">{device.deviceId}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        Allocated On
                      </div>
                      <div className="font-medium">
                        {new Date(device.allocatedOn).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        First Used
                      </div>
                      <div className="font-medium">
                        {getFirstUsedDate(device.deviceId)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Last Used
                      </div>
                      <div className="font-medium">
                        {getLastUsedDate(device.deviceId)}
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 text-center rounded-md bg-gray-50">
                          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                          <div className="text-xs text-gray-500">Total Days Used</div>
                        </div>
                        <div className="p-3 text-center rounded-md bg-gray-50">
                          <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
                          <div className="text-xs text-gray-500">This Month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {userData.devices.length === 0 && (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">No Devices Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              You don't have any devices allocated to you yet.
            </p>
          </div>
        )}
      </main>
      
      {/* Usage Modal */}
      <AddUsageModal
        isOpen={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        onAddUsage={handleAddUsage}
        userData={userData}
      />
    </div>
  );
};

export default DeviceTypeManagement;