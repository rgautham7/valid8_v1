import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Device, DeviceType } from '../../types';
import { 
  UserPlus, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  Search, 
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  Smartphone
} from 'lucide-react';

// UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter, 
  CardHeader,
  CardTitle 
} from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

import UserDetailsPopup from '../../components/provider/UserDetailsPopup';
import { toast } from 'react-hot-toast';

export default function ProviderHome() {
  const navigate = useNavigate();
  const { providerData, isAuthenticated, userRole } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalDevices: 0,
    allocatedDevices: 0,
    availableDevices: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeviceAllocation, setShowDeviceAllocation] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'provider') {
      navigate('/login/provider');
    }
  }, [isAuthenticated, userRole, navigate]);
  
  useEffect(() => {
    if (providerData) {
      fetchData();
    }
  }, [providerData]);
  
  useEffect(() => {
    if (!users.length) return;

    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.id.toLowerCase().includes(term)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        user.activity.toLowerCase() === filterStatus
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus]);
  
  const fetchData = async () => {
    if (!providerData) return;
    
    setIsLoading(true);
    
    try {
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const allUsers = JSON.parse(usersData);
        const providerUsers = allUsers.filter((user: User) => user.providerId === providerData.id);
        setUsers(providerUsers);
        setFilteredUsers(providerUsers);
        
        const activeUsers = providerUsers.filter((user: User) => user.activity === 'Active').length;
        setStatistics(prev => ({
          ...prev,
          totalUsers: providerUsers.length,
          activeUsers,
          inactiveUsers: providerUsers.length - activeUsers
        }));
      }
      
      let providerDeviceTypes = [];
      const deviceTypesData = localStorage.getItem('deviceTypes');
      if (deviceTypesData) {
        const allDeviceTypes = JSON.parse(deviceTypesData);
        providerDeviceTypes = allDeviceTypes.filter((type: DeviceType) => 
          providerData.deviceTypes.includes(type.code)
        );
        setDeviceTypes(providerDeviceTypes);
      }
      
      const devicesData = localStorage.getItem('devices');
      if (devicesData && providerDeviceTypes.length > 0) {
        const allDevices = JSON.parse(devicesData);
        const deviceTypeIds = providerDeviceTypes.map((type: DeviceType) => type.id);
        
        const providerDevices = allDevices.filter((device: Device) => 
          deviceTypeIds.includes(device.deviceTypeId)
        );
        setDevices(providerDevices);
        
        const allocatedDevices = providerDevices.filter((device: Device) => device.allocation === 'allocated').length;
        setStatistics(prev => ({
          ...prev,
          totalDevices: providerDevices.length,
          allocatedDevices,
          availableDevices: providerDevices.length - allocatedDevices
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDeviceTypeName = (code: string) => {
    const deviceType = deviceTypes.find(type => type.code === code);
    return deviceType ? deviceType.name : code;
  };

  const toggleUserActivity = async (user: User) => {
    setIsProcessing(true);
    
    try {
      const newActivity = user.activity === 'Active' ? 'Inactive' : 'Active';
      
      const usersData = localStorage.getItem('users');
      if (!usersData) {
        throw new Error('User data not available');
      }
      
      const allUsers: User[] = JSON.parse(usersData);
      const updatedUsers = allUsers.map(u => 
        u.id === user.id 
          ? { ...u, activity: newActivity } 
          : u
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
        
      setUsers(prev => 
        prev.map(u => 
          u.id === user.id 
            ? { ...u, activity: newActivity } 
            : u
        )
      );
      
      toast.success(`User ${user.name} is now ${newActivity}`);
    } catch (error) {
      console.error('Error toggling user activity:', error);
      toast.error('Failed to update user status');
    } finally {
      setIsProcessing(false);
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const calculateStatistics = () => {
    if (!users.length || !devices.length) return;
    
    const activeUsers = users.filter(user => user.activity === 'Active').length;
    const allocatedDevices = devices.filter(device => device.allocation === 'allocated').length;
    
    setStatistics({
      totalUsers: users.length,
      activeUsers,
      inactiveUsers: users.length - activeUsers,
      totalDevices: devices.length,
      allocatedDevices,
      availableDevices: devices.length - allocatedDevices
    });
  };
  
  const getDeviceTypesWithCounts = () => {
    if (!deviceTypes.length || !devices.length) return [];
    
    return deviceTypes.map(type => {
      const typeDevices = devices.filter(device => device.deviceTypeId === type.id);
      const allocatedCount = typeDevices.filter(device => device.allocation === 'allocated').length;
      
      return {
        ...type,
        totalCount: typeDevices.length,
        allocatedCount,
        availableCount: typeDevices.length - allocatedCount
      };
    });
  };
  
  const loadAvailableDevices = (deviceTypeCode: string) => {
    setSelectedDeviceType(deviceTypeCode);
    
    try {
      const deviceType = deviceTypes.find(type => type.code === deviceTypeCode);
      if (!deviceType) return;
      
      const availableDevs = devices.filter(device => 
        device.deviceTypeId === deviceType.id && 
        device.allocation === 'not allocated' &&
        device.status === 'active'
      );
      
      setAvailableDevices(availableDevs);
      setShowDeviceAllocation(true);
    } catch (error) {
      console.error('Error loading available devices:', error);
    }
  };
  
  const handleAllocateDevice = async () => {
    if (!selectedUser || !selectedDeviceType) return;
    
    try {
      const filteredDevices = getFilteredAvailableDevices();
      if (!filteredDevices.length) return;
      
      const deviceToAllocate = filteredDevices[0];
      
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) return;
      
      const allDevices = JSON.parse(devicesData);
      const updatedDevices = allDevices.map((d: Device) => {
        if (d.id === deviceToAllocate.id) {
          return {
            ...d,
            allocation: 'allocated',
            allocatedTo: selectedUser.id,
            lastUsedOn: new Date().toISOString()
          };
        }
        return d;
      });
      
      localStorage.setItem('devices', JSON.stringify(updatedDevices));
      
      const usersData = localStorage.getItem('users');
      if (!usersData) return;
      
      const allUsers = JSON.parse(usersData);
      const updatedUsers = allUsers.map((u: User) => {
        if (u.id === selectedUser.id) {
          const deviceType = deviceTypes.find(type => type.code === selectedDeviceType);
          
          const updatedDevices = [
            ...u.devices,
            {
              deviceId: deviceToAllocate.id,
              deviceType: selectedDeviceType,
              allocatedOn: new Date().toISOString(),
              lastUsedOn: new Date().toISOString()
            }
          ];
          
          return {
            ...u,
            devices: updatedDevices
          };
        }
        return u;
      });
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setDevices(prev => 
        prev.map(d => {
          if (d.id === deviceToAllocate.id) {
            return {
              ...d,
              allocation: 'allocated',
              allocatedTo: selectedUser.id,
              lastUsedOn: new Date().toISOString()
            };
          }
          return d;
        })
      );
      
      setUsers(prev => 
        prev.map(u => {
          if (u.id === selectedUser.id) {
            const updatedDevices = [
              ...u.devices,
              {
                deviceId: deviceToAllocate.id,
                deviceType: selectedDeviceType,
                allocatedOn: new Date().toISOString(),
                lastUsedOn: new Date().toISOString()
              }
            ];
            
            return {
              ...u,
              devices: updatedDevices
            };
          }
          return u;
        })
      );
      
      calculateStatistics();
      setShowDeviceAllocation(false);
      setSelectedDeviceType('');
      setDeviceSearchTerm('');
      
      if (showUserDetails) {
        const updatedUser = updatedUsers.find((u: User) => u.id === selectedUser.id);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error allocating device:', error);
    }
  };
  
  const handleRemoveDevice = async () => {
    if (!selectedUser || !selectedUser.devices.length) return;
    
    try {
      const deviceToRemove = selectedUser.devices[selectedUser.devices.length - 1];
      
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) return;
      
      const allDevices = JSON.parse(devicesData);
      const updatedDevices = allDevices.map((d: Device) => {
        if (d.id === deviceToRemove.deviceId) {
          return {
            ...d,
            allocation: 'not allocated',
            allocatedTo: undefined,
            lastUsedOn: undefined
          };
        }
        return d;
      });
      
      localStorage.setItem('devices', JSON.stringify(updatedDevices));
      
      const usersData = localStorage.getItem('users');
      if (!usersData) return;
      
      const allUsers = JSON.parse(usersData);
      const updatedUsers = allUsers.map((u: User) => {
        if (u.id === selectedUser.id) {
          const updatedDevices = u.devices.filter(d => d.deviceId !== deviceToRemove.deviceId);
          
          return {
            ...u,
            devices: updatedDevices
          };
        }
        return u;
      });
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setDevices(prev => 
        prev.map(d => {
          if (d.id === deviceToRemove.deviceId) {
            return {
              ...d,
              allocation: 'not allocated',
              allocatedTo: undefined,
              lastUsedOn: undefined
            };
          }
          return d;
        })
      );
      
      setUsers(prev => 
        prev.map(u => {
          if (u.id === selectedUser.id) {
            const updatedDevices = u.devices.filter(d => d.deviceId !== deviceToRemove.deviceId);
            
            return {
              ...u,
              devices: updatedDevices
            };
          }
          return u;
        })
      );
      
      calculateStatistics();
      
      const updatedUser = updatedUsers.find((u: User) => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      console.error('Error removing device:', error);
    }
  };
  
  const getFilteredAvailableDevices = () => {
    if (!availableDevices.length) return [];
    
    if (!deviceSearchTerm) return availableDevices;
    
    const term = deviceSearchTerm.toLowerCase();
    return availableDevices.filter(device => 
      device.id.toLowerCase().includes(term)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 rounded-full border-t-blue-500 border-b-blue-700 animate-spin"></div>
          <p className="mt-2">Loading provider data...</p>
        </div>
      </div>
    );
  }

  if (!providerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-center bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-red-600">Provider Data Not Found</h2>
          <p className="mb-4">Unable to load your provider information. Please try logging in again.</p>
          <Button onClick={() => navigate('/login/provider')}>
            Go to Login
              </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome, {providerData.name}</p>
      </div>
      
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>Total users under your management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.totalUsers}</div>
            <div className="flex items-center mt-2 space-x-2 text-sm">
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                {statistics.activeUsers} Active
              </span>
              <span className="flex items-center text-red-600">
                <XCircle className="w-4 h-4 mr-1" />
                {statistics.inactiveUsers} Inactive
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/provider/add-user')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Devices</CardTitle>
            <CardDescription>Total devices under your management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.totalDevices}</div>
            <div className="flex items-center mt-2 space-x-2 text-sm">
              <span className="flex items-center text-blue-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                {statistics.allocatedDevices} Allocated
              </span>
              <span className="flex items-center text-gray-600">
                <Cpu className="w-4 h-4 mr-1" />
                {statistics.availableDevices} Available
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/provider/manage-devices')}
            >
              <Cpu className="w-4 h-4 mr-2" />
              Manage Devices
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Device Types</CardTitle>
            <CardDescription>Types of devices you can manage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{deviceTypes.length}</div>
            <div className="mt-2 space-y-1">
              {deviceTypes.map(type => (
                <div key={type.id} className="text-sm">
                  {type.name}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/provider/file-upload')}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Upload Device Data
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col items-start justify-between mb-4 space-y-4 md:flex-row md:items-center md:space-y-0">
          <h2 className="text-2xl font-bold">Users</h2>
          
          <div className="flex flex-col w-full space-y-4 md:flex-row md:w-auto md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
      </div>
            
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active Users</SelectItem>
                <SelectItem value="inactive">Inactive Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-hidden bg-white border rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Age/Gender
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Devices
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.age} / {user.gender}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.devices.length > 0 ? (
                            <div className="flex flex-col">
                              {user.devices.map((device, index) => (
                                <span key={device.deviceId} className="text-xs">
                                  {getDeviceTypeName(device.deviceType)}
                                  {index < user.devices.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No devices</span>
              )}
          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                          user.activity === 'Active' 
                            ? 'text-green-800 bg-green-100' 
                            : 'text-red-800 bg-red-100'
                        }`}>
                          {user.activity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toggleUserActivity(user)}>
                              {user.activity === 'Active' ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Mark as Inactive
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Mark as Active
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {searchTerm || filterStatus !== 'all' 
                          ? 'No users match your search criteria' 
                          : 'No users found'}
          </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
                <div>
        <h2 className="mb-4 text-2xl font-bold">Device Types</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {getDeviceTypesWithCounts().map((type) => (
            <Card key={type.id}>
              <CardHeader>
                <CardTitle>{type.name}</CardTitle>
                <CardDescription>{type.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Devices:</span>
                    <span className="font-medium">{type.totalCount}</span>
                  </div>
                    <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Allocated:</span>
                    <span className="font-medium">{type.allocatedCount}</span>
                </div>
                    <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Available:</span>
                    <span className="font-medium">{type.availableCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedUser && (
        <UserDetailsPopup
          isOpen={showUserDetails}
          onClose={() => {
            setShowUserDetails(false);
            setTimeout(() => {
              setSelectedUser(null);
            }, 100);
          }}
          user={selectedUser}
          onAllocateDevice={(deviceType: string) => {
            loadAvailableDevices(deviceType);
            setShowUserDetails(false);
          }}
          onRemoveDevice={() => {
            handleRemoveDevice();
          }}
          getDeviceTypeName={getDeviceTypeName}
        />
      )}

      <Dialog open={showDeviceAllocation} onOpenChange={setShowDeviceAllocation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Device</DialogTitle>
            <DialogDescription>
              Select a device to allocate to {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4">
            <Label htmlFor="device-search">Search Devices</Label>
            <Input
              id="device-search"
              placeholder="Search by device ID..."
              value={deviceSearchTerm}
              onChange={(e) => setDeviceSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="mb-4 overflow-y-auto max-h-60">
            {getFilteredAvailableDevices().length > 0 ? (
              <div className="space-y-2">
                {getFilteredAvailableDevices().map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{device.id}</div>
                      <div className="text-xs text-gray-500">
                        Manufactured: {new Date(device.yearOfManufacturing).getFullYear()}
                      </div>
                    </div>
              <div>
                      <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                        Available
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No available devices found
        </div>
                )}
                      </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeviceAllocation(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAllocateDevice}
              disabled={getFilteredAvailableDevices().length === 0}
            >
              Allocate Device
            </Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}

const Label = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block mb-2 text-sm font-medium text-gray-700">
    {children}
  </label>
);