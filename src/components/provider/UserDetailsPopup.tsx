import React from 'react';
import { User as UserType } from '../../types';
import { User, X, Activity, Calendar, Clock, Smartphone, ToggleLeft, ToggleRight, Mail, Phone } from 'lucide-react';
import { getUserDevices } from '../../utils/deviceUtils';

interface UserDetailsPopupProps {
  user: UserType;
  onClose: () => void;
  onToggleActivity: (userId: string) => void;
}

const UserDetailsPopup: React.FC<UserDetailsPopupProps> = ({ 
  user, 
  onClose,
  onToggleActivity 
}) => {
  // Get user's devices with full details
  const userDevices = getUserDevices(user.id);
  
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format device type for display
  const formatDeviceType = (deviceType: string) => {
    return deviceType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl p-6 mx-4 bg-white rounded-lg shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute p-1 text-gray-500 transition-colors rounded-full top-4 right-4 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* User header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 mr-4 text-white bg-blue-500 rounded-full">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">ID: {user.id}</p>
          </div>
          <div className="flex items-center ml-auto">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mr-3
              ${user.activity === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {user.activity}
            </span>
            <button
              onClick={() => onToggleActivity(user.id)}
              className="p-1 text-gray-500 transition-colors rounded-full hover:bg-gray-100"
              title={`Toggle ${user.activity === 'Active' ? 'Inactive' : 'Active'}`}
            >
              {user.activity === 'Active' ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-red-500" />
              )}
            </button>
          </div>
        </div>
        
        {/* User details */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <User className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-sm text-gray-600">{user.name}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Age</p>
                  <p className="text-sm text-gray-600">{user.age} years</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Gender</p>
                  <p className="text-sm text-gray-600">{user.gender}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <User className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">User ID</p>
                  <p className="text-sm text-gray-600">{user.id}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <p className="text-sm text-gray-600">{user.activity}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Device Count</p>
                  <p className="text-sm text-gray-600">{user.devices.length} devices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User devices */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Assigned Devices</h3>
          {user.devices.length > 0 ? (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                      Device ID
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                      Allocated On
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                      Last Used
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.devices.map((device, index) => {
                    // Find full device details
                    const fullDevice = userDevices.find(d => d.id === device.deviceId);
                    
                    return (
                      <tr key={device.deviceId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-700">{device.deviceId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="flex items-center">
                            <Smartphone className="w-4 h-4 mr-1 text-blue-500" />
                            {device.deviceType}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDate(device.allocatedOn)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDate(device.lastUsedOn)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {fullDevice ? (
                            <div className="text-xs">
                              <p>Year: {fullDevice.yearOfManufacturing}</p>
                              <p>Validity: {fullDevice.validity}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">No details</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 rounded-lg bg-gray-50">
              No devices assigned to this user.
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPopup;
