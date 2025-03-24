// src/pages/admin/DeviceManagement.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Plus, Search, ArrowLeft, Loader2, 
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import Breadcrumb from '../../components/ui/breadcrumb';

// Utils
import { getFromStorage, saveToStorage } from '../../utils/storageUtils';

// Types
import { Device, DeviceType, Provider, User } from '../../types';
import { Label } from '@/components/ui/label';

const DeviceManagement: React.FC = () => {
  const { deviceTypeId } = useParams<{ deviceTypeId: string }>();
  const navigate = useNavigate();
  
  // State for devices and device type
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allocationFilter, setAllocationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // State for allocation dialog
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [providerUsers, setProviderUsers] = useState<User[]>([]);
  
  // State for deallocation dialog
  const [isDeallocationDialogOpen, setIsDeallocationDialogOpen] = useState(false);
  const [deviceToDeallocate, setDeviceToDeallocate] = useState<Device | null>(null);
  
  // Load device type, devices, providers, and users
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      
      try {
        // Load device type
        const deviceTypes = getFromStorage<DeviceType[]>('deviceTypes', []);
        const foundDeviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
        
        if (!foundDeviceType) {
          toast.error('Device type not found');
          navigate('/admin/device-type-management');
          return;
        }
        
        setDeviceType(foundDeviceType);
        
        // Load devices for this device type
        const allDevices = getFromStorage<Device[]>('devices', []);
        const typeDevices = allDevices.filter(device => device.deviceTypeId === deviceTypeId);
        
        setDevices(typeDevices);
        setFilteredDevices(typeDevices);
        
        // Load providers
        const allProviders = getFromStorage<Provider[]>('providers', []);
        setProviders(allProviders);
        
        // Load users
        const allUsers = getFromStorage<User[]>('users', []);
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [deviceTypeId, navigate]);
  
  // Filter devices based on search term and allocation status
  useEffect(() => {
    if (!devices.length) return;

    let result = [...devices];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(device => 
        device.id.toLowerCase().includes(term) ||
        device.yearOfManufacturing.toLowerCase().includes(term) ||
        device.validity.toLowerCase().includes(term)
      );
    }

    // Apply allocation filter
    if (allocationFilter !== 'all') {
      result = result.filter(device => 
        device.allocation === allocationFilter
      );
    }

    setFilteredDevices(result);
  }, [devices, searchTerm, allocationFilter]);
  
  // Update provider users when provider changes
  useEffect(() => {
    if (selectedProviderId) {
      const filteredUsers = users.filter(user => user.providerId === selectedProviderId);
      setProviderUsers(filteredUsers);
      setSelectedUserId('');
    } else {
      setProviderUsers([]);
    }
  }, [selectedProviderId, users]);
  
  // Handle adding a new device
  const handleAddDevice = () => {
    navigate(`/admin/add-device?deviceTypeId=${deviceTypeId}`);
  };
  
  // Open allocation dialog
  const openAllocationDialog = (device: Device) => {
    if (device.allocation === 'allocated') {
      toast.error('Device is already allocated');
      return;
    }
    
    setSelectedDevice(device);
    setSelectedProviderId('');
    setSelectedUserId('');
    setIsAllocationDialogOpen(true);
  };
  
  // Open deallocation dialog
  const openDeallocationDialog = (device: Device) => {
    if (device.allocation === 'not allocated') {
      toast.error('Device is not allocated');
      return;
    }
    
    setDeviceToDeallocate(device);
    setIsDeallocationDialogOpen(true);
  };
  
  // Handle device allocation
  const handleAllocateDevice = () => {
    if (!selectedDevice || !selectedProviderId || !selectedUserId) {
      toast.error('Please select a provider and user');
      return;
    }
    
    try {
      // Update device in state
      const updatedDevices = devices.map(device => 
        device.id === selectedDevice.id 
          ? { 
              ...device, 
              allocation: 'allocated' as const, 
              allocatedTo: selectedUserId,
              lastUsedOn: new Date().toISOString().split('T')[0]
            } 
          : device
      );
      
      setDevices(updatedDevices);
      
      // Update localStorage
      const allDevices = getFromStorage<Device[]>('devices', []);
      const updatedAllDevices = allDevices.map(device => 
        device.id === selectedDevice.id 
          ? { 
              ...device, 
              allocation: 'allocated' as const, 
              allocatedTo: selectedUserId,
              lastUsedOn: new Date().toISOString().split('T')[0]
            } 
          : device
      );
      
      saveToStorage('devices', updatedAllDevices);
      
      // Update user's devices in localStorage
      const allUsers = getFromStorage<User[]>('users', []);
      const updatedUsers = allUsers.map(user => {
        if (user.id === selectedUserId) {
          // Check if device is already in user's devices
          const deviceExists = user.devices.some(d => d.deviceId === selectedDevice.id);
          
          if (!deviceExists) {
            return {
              ...user,
              devices: [
                ...user.devices,
                {
                  deviceId: selectedDevice.id,
                  deviceType: deviceType?.code || '',
                  allocatedOn: new Date().toISOString().split('T')[0],
                  lastUsedOn: new Date().toISOString().split('T')[0]
                }
              ]
            };
          }
        }
        return user;
      });
      
      saveToStorage('users', updatedUsers);
      
      // Close dialog and show success message
      setIsAllocationDialogOpen(false);
      setSelectedDevice(null);
      toast.success('Device allocated successfully');
    } catch (error) {
      console.error('Error allocating device:', error);
      toast.error('Failed to allocate device');
    }
  };
  
  // Handle device deallocation
  const handleDeallocateDevice = () => {
    if (!deviceToDeallocate) return;
    
    try {
      // Get user ID before updating
      const userId = deviceToDeallocate.allocatedTo;
      
      // Update device in state
      const updatedDevices = devices.map(device => 
        device.id === deviceToDeallocate.id 
          ? { 
              ...device, 
              allocation: 'not allocated' as const, 
              allocatedTo: undefined
            } 
          : device
      );
      
      setDevices(updatedDevices);
      
      // Update localStorage
      const allDevices = getFromStorage<Device[]>('devices', []);
      const updatedAllDevices = allDevices.map(device => 
        device.id === deviceToDeallocate.id 
          ? { 
              ...device, 
              allocation: 'not allocated' as const, 
              allocatedTo: undefined
            } 
          : device
      );
      
      saveToStorage('devices', updatedAllDevices);
      
      // Update user's devices in localStorage if user ID exists
      if (userId) {
        const allUsers = getFromStorage<User[]>('users', []);
        const updatedUsers = allUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              devices: user.devices.filter(d => d.deviceId !== deviceToDeallocate.id)
            };
          }
          return user;
        });
        
        saveToStorage('users', updatedUsers);
      }
      
      // Close dialog and show success message
      setIsDeallocationDialogOpen(false);
      setDeviceToDeallocate(null);
      toast.success('Device deallocated successfully');
    } catch (error) {
      console.error('Error deallocating device:', error);
      toast.error('Failed to deallocate device');
    }
  };
  
  // Get user name from ID
  const getProviderName = (providerId?: string) => {
    if (!providerId) return 'Not allocated';
    
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.name : 'Unknown Provider';
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/device-type-management');
  };
  
  // Add breadcrumbs to the component
  const breadcrumbItems = [
    { title: 'Dashboard', path: '/admin' },
    { title: 'Device Types', path: '/admin/device-type-management' },
    { title: deviceType?.name || 'Devices', path: `/admin/device-management/${deviceTypeId}` }
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading devices...</span>
      </div>
    );
  }
  
  if (!deviceType) {
    return (
      <div className="container p-6 mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="py-10 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
              <h2 className="mb-2 text-xl font-semibold">Device Type Not Found</h2>
              <p className="mb-4 text-muted-foreground">
                The device type you're looking for doesn't exist.
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Device Types
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container p-6 mx-auto">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-2"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <CardTitle className="text-2xl">
              {deviceType.name} Devices
            </CardTitle>
            <CardDescription>
              Manage devices for {deviceType.name} ({deviceType.code})
            </CardDescription>
          </div>
          <Button onClick={handleAddDevice} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Add Device
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search devices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={allocationFilter}
              onValueChange={setAllocationFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by allocation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="not allocated">Not Allocated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Devices Table */}
          {filteredDevices.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">No devices found</p>
              <Button onClick={handleAddDevice} variant="outline" className="mt-4">
                <Plus className="w-4 h-4 mr-2" /> Add Device
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Manufacturing Year</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Allocation</TableHead>
                    <TableHead>Allocated To</TableHead>
                    <TableHead>Last Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.id}</TableCell>
                      <TableCell>{device.yearOfManufacturing}</TableCell>
                      <TableCell>{device.validity}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={device.status === 'active' ? 'default' : 'destructive'}
                        >
                          {device.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={device.allocation === 'allocated' ? 'secondary' : 'outline'}
                        >
                          {device.allocation}
                        </Badge>
                      </TableCell>
                      <TableCell>{getProviderName(device.providerAllocation)}</TableCell>
                      <TableCell>{device.lastUsedOn || 'N/A'}</TableCell>
                      {/* <TableCell className="text-right">
                        {device.allocation === 'allocated' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeallocationDialog(device)}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Deallocate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAllocationDialog(device)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Allocate
                          </Button>
                        )}
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Allocate Device Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Device</DialogTitle>
            <DialogDescription>
              Select a provider and user to allocate this device to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={selectedProviderId}
                onValueChange={setSelectedProviderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name} ({provider.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={!selectedProviderId || providerUsers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedProviderId 
                      ? "Select a provider first" 
                      : providerUsers.length === 0 
                        ? "No users for this provider" 
                        : "Select a user"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {providerUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAllocateDevice}
              disabled={!selectedProviderId || !selectedUserId}
            >
              Allocate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Deallocation Dialog */}
      <Dialog open={isDeallocationDialogOpen} onOpenChange={setIsDeallocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deallocate Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to deallocate this device?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {deviceToDeallocate && (
              <div className="space-y-2">
                <p><strong>Device ID:</strong> {deviceToDeallocate.id}</p>
                <p><strong>Currently allocated to:</strong> {getProviderName(deviceToDeallocate.providerAllocation)}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeallocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeallocateDevice}
            >
              Deallocate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeviceManagement;