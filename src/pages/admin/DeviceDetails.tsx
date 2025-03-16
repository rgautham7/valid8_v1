import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import StatsCard from '../../components/ui/StatsCard';
import DeviceTypeSelect from '../../components/admin/DeviceTypeSelect';
import UserDetailsTable from '../../components/admin/UserDetailsTable';
import ProviderDetailsTable from '../../components/admin/ProviderDetailsTable';
import { deviceTypes, providers, users } from '../../data/mockData';

export default function DeviceDetails() {
  const { deviceType } = useParams<{ deviceType: string }>();
  const [selectedDeviceType, setSelectedDeviceType] = useState(
    deviceType || ''
  );
  const [activeTab, setActiveTab] = useState<'users' | 'providers'>('providers');

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!deviceType) return { filteredUsers: [], filteredProviders: [] };

    // Filter users who have the selected device type
    const filteredUsers = users.filter(user =>
      user.devices.some(device => device.deviceType === deviceType)
    );

    // Filter providers who handle the selected device type
    const filteredProviders = providers.filter(provider =>
      provider.deviceTypes.includes(deviceType)
    );

    return { filteredUsers, filteredProviders };
  }, [deviceType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const activeDevices = filteredData.filteredUsers.filter(user => 
      user.activity === 'Active' &&
      user.devices.some(device => device.deviceType === deviceType)
    ).length;

    return {
      deviceTypes: deviceTypes.length,
      totalDevices: filteredData.filteredUsers.reduce((acc, user) => 
        acc + user.devices.filter(d => d.deviceType === deviceType).length, 0
      ),
      activeDevices,
      totalUsers: filteredData.filteredUsers.length
    };
  }, [filteredData, deviceType]);

  // Format device type for display
  const formatDeviceType = (type: string) => 
    type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-gray-100">
      
      <main className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Device Type:</h2>
            <DeviceTypeSelect 
              value={formatDeviceType(selectedDeviceType)}
              onChange={(value) => setSelectedDeviceType(value.toLowerCase().replace(' ', '-'))}
              options={deviceTypes.map(dt => formatDeviceType(dt.code))}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-4">
            <StatsCard title="No of Device types" value={stats.deviceTypes.toString()} />
            <StatsCard title="No of Devices" value={stats.totalDevices.toString()} />
            <StatsCard title="No of Active Devices" value={stats.activeDevices.toString()} />
            <StatsCard title="No of Users" value={stats.totalUsers.toString()} />
          </div>

          <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px space-x-8">
                
                <button
                  onClick={() => setActiveTab('providers')}
                  className={`${
                    activeTab === 'providers'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base`}
                >
                  Provider Details
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base`}
                >
                  User Details
                </button>
                
              </nav>
            </div>
          </div>

          {activeTab === 'users' ? (
            <UserDetailsTable 
              users={filteredData.filteredUsers} 
              deviceType={deviceType || ''} 
            />
          ) : (
            <ProviderDetailsTable 
              providers={filteredData.filteredProviders} 
              deviceType={deviceType || ''} 
            />
          )}
        </div>
      </main>
    </div>
  );
}