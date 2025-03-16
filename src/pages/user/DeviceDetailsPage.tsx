import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUsage } from '../../context/UsageContext';
import UserNavbar from '../../components/layout/UserNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Plus, 
  Smartphone, 
  Info, 
  BarChart4, 
  CheckCircle2,
  Factory,
  Globe,
  FileText
} from 'lucide-react';
import AddUsageModal from '../../components/user/AddUsageModal';
import { format, subMonths } from 'date-fns';
import { UserDevice } from '../../types';

const DeviceDetailsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { usageHistory, addUsage, getUserDeviceUsage } = useUsage();
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [deviceTypeInfo, setDeviceTypeInfo] = useState<any>(null);
  const [userDevice, setUserDevice] = useState<UserDevice | null>(null);
  const [usageStats, setUsageStats] = useState<{
    total: number;
    thisMonth: number;
    lastMonth: number;
    monthlyData: { month: string; count: number }[];
  }>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    monthlyData: []
  });

  // Load device and device type information
  useEffect(() => {
    if (!deviceId || !userData) return;

    // Find user's device
    const device = userData.devices.find(d => d.deviceId === deviceId);
    if (device) {
      setUserDevice(device);

      // Load device info from localStorage
      try {
        const devicesData = localStorage.getItem('devices');
        if (devicesData) {
          const devices = JSON.parse(devicesData);
          const deviceInfo = devices.find((d: any) => d.id === deviceId);
          if (deviceInfo) {
            setDeviceInfo(deviceInfo);

            // Load device type info
            const deviceTypesData = localStorage.getItem('deviceTypes');
            if (deviceTypesData) {
              const deviceTypes = JSON.parse(deviceTypesData);
              const typeInfo = deviceTypes.find((t: any) => t.id === deviceInfo.deviceTypeId);
              if (typeInfo) {
                setDeviceTypeInfo(typeInfo);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading device information:', error);
      }
    }
  }, [deviceId, userData]);

  // Calculate usage statistics
  useEffect(() => {
    if (!deviceId || !userData) return;

    const usage = getUserDeviceUsage(userData.id, deviceId);
    
    // Current month stats
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const thisMonthUsage = usage.filter(u => {
      const date = new Date(u.timestamp);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Last month stats
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthUsage = usage.filter(u => {
      const date = new Date(u.timestamp);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });
    
    // Monthly data for the past 6 months
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const date = subMonths(currentDate, i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthUsage = usage.filter(u => {
        const uDate = new Date(u.timestamp);
        return uDate.getMonth() === month && uDate.getFullYear() === year;
      });
      
      monthlyData.push({
        month: format(date, 'MMM yyyy'),
        count: monthUsage.length
      });
    }
    
    setUsageStats({
      total: usage.length,
      thisMonth: thisMonthUsage.length,
      lastMonth: lastMonthUsage.length,
      monthlyData: monthlyData.reverse() // Show oldest to newest
    });
  }, [deviceId, userData, usageHistory, getUserDeviceUsage]);

  const handleAddUsage = (deviceIds: string[], timestamp: string) => {
    if (!userData || !userDevice) return;
    addUsage(deviceIds, timestamp);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!userData || !userDevice || !deviceInfo || !deviceTypeInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading device information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      
      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/user/devices')}
            className="p-2 mr-2 text-gray-500 bg-white rounded-full shadow-sm hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {deviceTypeInfo.name}
          </h1>
        </div>
        
        {/* Action button */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowUsageModal(true)}
            className="w-full py-6 text-lg font-medium md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Record Usage
          </Button>
        </div>
        
        {/* Device Info */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          {/* Device Details */}
          <Card>
            <CardHeader className="border-b border-blue-100 bg-blue-50">
              <CardTitle className="flex items-center text-lg text-blue-900">
                <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                Device Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">Device ID</div>
                  <div className="font-medium">{deviceId}</div>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Allocated On
                  </div>
                  <div className="font-medium">
                    {formatDate(userDevice.allocatedOn)}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Last Used
                  </div>
                  <div className="font-medium">
                    {formatDate(userDevice.lastUsedOn)}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Status
                  </div>
                  <div className="font-medium">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      deviceInfo.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {deviceInfo.status.charAt(0).toUpperCase() + deviceInfo.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Validity
                  </div>
                  <div className="font-medium">
                    {formatDate(deviceInfo.validity)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Usage Statistics */}
          <Card>
            <CardHeader className="border-b border-blue-100 bg-blue-50">
              <CardTitle className="flex items-center text-lg text-blue-900">
                <BarChart4 className="w-5 h-5 mr-2 text-blue-600" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 text-center rounded-md bg-gray-50">
                  <div className="text-2xl font-bold text-blue-600">{usageStats.total}</div>
                  <div className="text-xs text-gray-500">Total Uses</div>
                </div>
                <div className="p-3 text-center rounded-md bg-gray-50">
                  <div className="text-2xl font-bold text-green-600">{usageStats.thisMonth}</div>
                  <div className="text-xs text-gray-500">This Month</div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Monthly Usage</h4>
                <div className="h-40 overflow-hidden">
                  <div className="flex items-end justify-between h-32 space-x-1">
                    {usageStats.monthlyData.map((month, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-blue-500 rounded-t"
                          style={{ 
                            height: `${Math.max(month.count * 8, 4)}px`,
                            maxHeight: '128px'
                          }}
                        ></div>
                        <div className="mt-1 text-xs text-gray-500 truncate" style={{ maxWidth: '100%' }}>
                          {month.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Device Type Information */}
        <Card className="mb-6">
          <CardHeader className="border-b border-blue-100 bg-blue-50">
            <CardTitle className="flex items-center text-lg text-blue-900">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              Device Type Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Factory className="w-4 h-4 mr-1" />
                    Manufacturer
                  </div>
                  <div className="font-medium">
                    {deviceTypeInfo.manufacturer || 'N/A'}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Globe className="w-4 h-4 mr-1" />
                    Country of Origin
                  </div>
                  <div className="font-medium">
                    {deviceTypeInfo.countryOfOrigin || 'N/A'}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Year of Manufacturing
                  </div>
                  <div className="font-medium">
                    {deviceTypeInfo.yearOfManufacturing || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="mb-1 text-sm text-gray-500">Parameters</div>
                  <div className="p-2 text-sm rounded-md bg-gray-50">
                    {deviceTypeInfo.parameters || 'No parameters specified'}
                  </div>
                </div>
                
                <div>
                  <div className="mb-1 text-sm text-gray-500">Remarks</div>
                  <div className="p-2 text-sm rounded-md bg-gray-50">
                    {deviceTypeInfo.remarks || 'No remarks specified'}
                  </div>
                </div>
                
                {deviceTypeInfo.manualUrl && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="w-4 h-4 mr-1" />
                      Manual
                    </div>
                    <a 
                      href={deviceTypeInfo.manualUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Manual
                    </a>
                  </div>
                )}
                
                {deviceTypeInfo.videoUrl && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="w-4 h-4 mr-1" />
                      Instructional Video
                    </div>
                    <a 
                      href={deviceTypeInfo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Watch Video
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Usage History */}
        <Card>
          <CardHeader className="border-b border-blue-100 bg-blue-50">
            <CardTitle className="flex items-center text-lg text-blue-900">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Recent Usage History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {getUserDeviceUsage(userData.id, deviceId).slice(0, 5).length > 0 ? (
              <div className="space-y-4">
                {getUserDeviceUsage(userData.id, deviceId)
                  .slice(0, 5)
                  .map((usage, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          {new Date(usage.timestamp).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{usage.usageTime}</span>
                      </div>
                    </div>
                  ))}
                
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/user/usage-history?deviceId=${deviceId}`)}
                    className="mt-2"
                  >
                    View Full History
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500">No usage history found for this device.</p>
                <Button 
                  onClick={() => setShowUsageModal(true)}
                  className="mt-4"
                >
                  Record First Usage
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Usage Modal */}
      <AddUsageModal
        isOpen={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        onAddUsage={handleAddUsage}
        userData={userData}
        preselectedDeviceId={deviceId}
      />
    </div>
  );
};

export default DeviceDetailsPage; 