import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Monitor, Plus, Calendar, Clock } from 'lucide-react';
import DeviceUsageHeatmap from '../../components/dashboard/DeviceUsageHeatmap';
import { useAuth } from '../../context/AuthContext';
import { useUsage } from '../../context/UsageContext';
import AddUsageModal from '../../components/user/AddUsageModal';
import UsageReminderPopup from '../../components/user/UsageReminderPopup';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { format } from 'date-fns';

const UserHome: React.FC = () => {
  const navigate = useNavigate();
  const { userData, isAuthenticated, userRole } = useAuth();
  const { 
    addUsage, 
    getDeviceUsageData, 
    getFirstUsageDate, 
    getCurrentMonthUsageDays 
  } = useUsage();
  
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [deviceUsage, setDeviceUsage] = useState<{ date: string; count: number; devices: string[] }[]>([]);
  const [providerName, setProviderName] = useState<string>('');
  const [firstUsageDate, setFirstUsageDate] = useState<string | null>(null);
  const [currentMonthUsageDays, setCurrentMonthUsageDays] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'user') {
      navigate('/login/user');
    }
  }, [isAuthenticated, userRole, navigate]);

  // Fetch provider name
  useEffect(() => {
    if (userData?.providerId) {
      setIsLoading(true);
      try {
        const providersData = localStorage.getItem('providers');
        if (providersData) {
          const providers = JSON.parse(providersData);
          const provider = providers.find((p: any) => p.id === userData.providerId);
          if (provider) {
            setProviderName(provider.name);
          }
        }
      } catch (error) {
        console.error('Error fetching provider data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [userData]);

  // Process usage data for heatmap and statistics
  useEffect(() => {
    if (userData) {
      setIsLoading(true);
      try {
        // Get usage data for heatmap
        const usageData = getDeviceUsageData(userData.id);
        setDeviceUsage(usageData);
        
        // Get first usage date
        const firstDate = getFirstUsageDate(userData.id);
        setFirstUsageDate(firstDate);
        
        // Get current month usage days
        const monthUsageDays = getCurrentMonthUsageDays(userData.id);
        setCurrentMonthUsageDays(monthUsageDays);
      } catch (error) {
        console.error('Error processing usage data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [userData, getDeviceUsageData, getFirstUsageDate, getCurrentMonthUsageDays]);

  const handleAddUsage = (deviceIds: string[], timestamp: string) => {
    if (!userData) return;
    
    try {
      addUsage(deviceIds, timestamp);
      
      // Refresh usage data
      const usageData = getDeviceUsageData(userData.id);
      setDeviceUsage(usageData);
      
      // Update statistics
      const firstDate = getFirstUsageDate(userData.id);
      setFirstUsageDate(firstDate);
      
      const monthUsageDays = getCurrentMonthUsageDays(userData.id);
      setCurrentMonthUsageDays(monthUsageDays);
    } catch (error) {
      console.error('Error adding usage:', error);
    }
  };

  // Calculate total days used
  const calculateDaysUsed = () => {
    if (!deviceUsage.length) return 0;
    return deviceUsage.length;
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get current month name
  const getCurrentMonthName = () => {
    return format(new Date(), 'MMMM');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 rounded-full border-t-blue-500 border-b-blue-700 animate-spin"></div>
          <p className="mt-2">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-center bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-red-600">User Data Not Found</h2>
          <p className="mb-4">Unable to load your user information. Please try logging in again.</p>
          <Button onClick={() => navigate('/login/user')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Hello {userData.name}!</h1>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            You are registered under <span className="font-medium text-blue-600">{providerName}</span>
          </p>
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

        {/* Info cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-10 h-10 p-2 text-orange-500 bg-orange-100 rounded-full" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Device allocated on</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userData.devices.length > 0 
                      ? new Date(userData.devices[0].allocatedOn).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Monitor className="w-10 h-10 p-2 text-green-500 bg-green-100 rounded-full" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Days used (since {formatDate(firstUsageDate)})
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{calculateDaysUsed()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-10 h-10 p-2 text-blue-500 bg-blue-100 rounded-full" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Days used in {getCurrentMonthName()}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{currentMonthUsageDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device list */}
        {userData.devices.length > 0 ? (
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">Your Devices</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userData.devices.map((device) => (
                <Card key={device.deviceId} className="overflow-hidden hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">{device.deviceType}</h3>
                      <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">
                        {device.deviceId}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Allocated On:</span>
                        <span>{new Date(device.allocatedOn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Used:</span>
                        <span>{device.lastUsedOn ? new Date(device.lastUsedOn).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate(`/user/devices/${device.deviceId}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 mb-6 text-center bg-white rounded-lg shadow">
            <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">No Devices Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              You don't have any devices allocated to you yet.
            </p>
          </div>
        )}

        {/* Heatmap */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b border-blue-100 bg-blue-50">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-lg font-medium text-blue-900">Device Usage History</h2>
              </div>
            </div>
            <div className="p-4">
              <DeviceUsageHeatmap
                data={deviceUsage}
                title=""
                showDeviceInfo={true}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Usage Modal */}
      <AddUsageModal
        isOpen={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        onAddUsage={handleAddUsage}
        userData={userData}
      />
      
      {/* Usage Reminder Popup */}
      <UsageReminderPopup
        onAddNow={() => setShowUsageModal(true)}
        onAddLater={() => {}}
      />
    </div>
  );
};

export default UserHome;

export { UserHome }