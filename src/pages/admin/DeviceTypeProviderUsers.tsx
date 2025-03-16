import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { users, providers } from '../../data/mockData';

export default function DeviceTypeProviderUsers() {
  const { deviceType, providerId } = useParams<{ deviceType: string; providerId: string }>();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch provider details
  const provider = useMemo(() => providers.find(p => p.id === providerId), [providerId]);

  // Filter users dynamically based on provider, device type, and search term
  const filteredUsers = useMemo(() => {
    if (!deviceType || !providerId) return [];

    return users.filter(user =>
      user.providerId === providerId &&
      user.devices.some(device => device.deviceType === deviceType) &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, providerId, deviceType, searchTerm]);

  if (!provider) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        <h2 className="text-xl font-semibold">❌ Provider not found</h2>
        <Link to="/admin">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-6 py-10 mx-auto max-w-7xl">
        {/* Provider Information Section */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{provider.name}</h1>
          <p className="text-gray-600">
            <span className="font-semibold text-blue-600">Device Type:</span>{' '}
            {deviceType?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Users List</h2>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search User.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-3 pr-10 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100">
              <tr>
                {['User ID', 'Name', 'Device ID', 'Allocated On', 'Last Used On', 'Status'].map(header => (
                  <th key={header} className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  const deviceInfo = user.devices.find(d => d.deviceType === deviceType);
                  return (
                    <tr key={user.id} className="transition hover:bg-gray-100">
                      <td className="px-6 py-4 text-sm text-gray-700">{user.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{deviceInfo?.deviceId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{deviceInfo?.allocatedOn || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{deviceInfo?.lastUsedOn || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                          ${user.activity === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.activity}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm text-center text-gray-500">
                    No users found for this provider and device type
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
