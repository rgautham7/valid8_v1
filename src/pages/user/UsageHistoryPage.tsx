import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUsage } from '../../context/UsageContext';
import UserNavbar from '../../components/layout/UserNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Calendar, Clock, Filter, Search } from 'lucide-react';
import { DeviceUsage } from '../../types/index';
import { format } from 'date-fns';

const UsageHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { getAllUserUsage } = useUsage();
  const [usageHistory, setUsageHistory] = useState<DeviceUsage[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<DeviceUsage[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // Load device types and usage history
  useEffect(() => {
    if (userData) {
      // Load device types
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
      
      // Load usage history
      const history = getAllUserUsage(userData.id);
      setUsageHistory(history);
      setFilteredHistory(history);
    }
  }, [userData, getAllUserUsage]);

  // Apply filters when search term, device type, or date range changes
  useEffect(() => {
    if (!userData) return;
    
    let filtered = usageHistory;
    
    // Filter by device type
    if (selectedDeviceType !== 'all') {
      filtered = filtered.filter(usage => usage.deviceType === selectedDeviceType);
    }
    
    // Filter by date range
    filtered = filtered.filter(usage => {
      const usageDate = usage.usageDate;
      return usageDate >= dateRange.start && usageDate <= dateRange.end;
    });
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(usage => 
        usage.deviceId.toLowerCase().includes(term) ||
        (deviceTypes[usage.deviceType]?.name || usage.deviceType).toLowerCase().includes(term)
      );
    }
    
    // Sort by date (newest first)
    filtered = [...filtered].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setFilteredHistory(filtered);
  }, [usageHistory, searchTerm, selectedDeviceType, dateRange, deviceTypes]);

  // Get unique device types from user's devices
  const getUserDeviceTypes = () => {
    if (!userData) return [];
    
    const types = new Set<string>();
    userData.devices.forEach(device => {
      types.add(device.deviceType);
    });
    
    return Array.from(types);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString;
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
            onClick={() => navigate('/user/devices')}
            className="p-2 mr-2 text-gray-500 bg-white rounded-full shadow-sm hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Usage History</h1>
        </div>
        
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by device..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Device Type Filter */}
              <div className="relative">
                <Filter className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <select
                  value={selectedDeviceType}
                  onChange={(e) => setSelectedDeviceType(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Device Types</option>
                  {getUserDeviceTypes().map(type => (
                    <option key={type} value={type}>
                      {deviceTypes[type]?.name || type}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-xs text-gray-500">From</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs text-gray-500">To</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Usage History List */}
        <div className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map(usage => (
              <Card key={usage.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-3 md:mb-0">
                      <h3 className="text-lg font-medium">
                        {deviceTypes[usage.deviceType]?.name || usage.deviceType}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Device ID: {usage.deviceId}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(usage.usageDate)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(usage.usageTime)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-lg shadow">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">No Usage Records Found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || selectedDeviceType !== 'all' || dateRange.start !== format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') || dateRange.end !== format(new Date(), 'yyyy-MM-dd')
                  ? 'Try adjusting your filters to see more results.'
                  : 'You haven\'t recorded any device usage yet.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UsageHistoryPage; 