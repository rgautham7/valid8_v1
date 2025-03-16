import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, Loader2, AlertCircle, 
  CheckCircle, XCircle, ArrowLeft, ArrowRight, Info
} from 'lucide-react';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

// Auth Context
import { useAuth } from '../../context/AuthContext';

// Types
import { Provider, Device, DeviceType, User } from '../../types';

// Device type statistics interface
interface DeviceTypeStats {
  code: string;
  name: string;
  total: number;
  active: number;
  inactive: number;
  allocated: number;
  available: number;
}

// Add these imports at the top of the file
import DeviceTypeGrid from '../../components/provider/DeviceTypeGrid';

export default function ManageDevices() {
  const { providerId } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [provider, setProvider] = useState<Provider | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deviceTypeStats, setDeviceTypeStats] = useState<DeviceTypeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Device list dialog
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [isDeviceListOpen, setIsDeviceListOpen] = useState(false);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [allocationFilter, setAllocationFilter] = useState<'all' | 'allocated' | 'available'>('all');
  
  // Load provider, device types, and devices
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        if (!providerId) {
          throw new Error('Provider ID not available');
        }
        
        // Load provider data
        const providersData = localStorage.getItem('providers');
        if (!providersData) {
          throw new Error('Provider data not available');
        }
        
        const providers: Provider[] = JSON.parse(providersData);
        const foundProvider = providers.find(p => p.id === providerId);
        
        if (!foundProvider) {
          throw new Error('Provider not found');
        }
        
        setProvider(foundProvider);
        
        // Load device types
        const deviceTypesData = localStorage.getItem('deviceTypes');
        if (!deviceTypesData) {
          throw new Error('Device type data not available');
        }
        
        const allDeviceTypes: DeviceType[] = JSON.parse(deviceTypesData);
        setDeviceTypes(allDeviceTypes);
        
        // Load devices
        const devicesData = localStorage.getItem('devices');
        if (!devicesData) {
          throw new Error('Device data not available');
        }
        
        const allDevices: Device[] = JSON.parse(devicesData);
        setDevices(allDevices);
        
        // Load users for this provider
        const usersData = localStorage.getItem('users');
        if (!usersData) {
          throw new Error('User data not available');
        }
        
        const allUsers: User[] = JSON.parse(usersData);
        const providerUsers = allUsers.filter(user => user.providerId === providerId);
        setUsers(providerUsers);
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load device data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [providerId]);
  
  // Calculate device type statistics
  useEffect(() => {
    if (!provider || !deviceTypes.length || !devices.length) return;
    
    const stats: DeviceTypeStats[] = provider.deviceTypes.map(deviceTypeCode => {
      const deviceType = deviceTypes.find(dt => dt.code === deviceTypeCode);
      const deviceTypeName = deviceType ? deviceType.name : deviceTypeCode;
      
      // Find all devices of this type
      const deviceTypeId = deviceType?.id;
      const typeDevices = devices.filter(device => {
        const dt = deviceTypes.find(dt => dt.id === device.deviceTypeId);
        return dt?.code === deviceTypeCode;
      });
      
      const totalDevices = typeDevices.length;
      const activeDevices = typeDevices.filter(device => device.status === 'active').length;
      const allocatedDevices = typeDevices.filter(device => device.allocation === 'allocated').length;
      
      return {
        code: deviceTypeCode,
        name: deviceTypeName,
        total: totalDevices,
        active: activeDevices,
        inactive: totalDevices - activeDevices,
        allocated: allocatedDevices,
        available: totalDevices - allocatedDevices
      };
    });
    
    setDeviceTypeStats(stats);
  }, [provider, deviceTypes, devices]);
  
  // Get user name by ID
  const getUserName = (userId?: string) => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId;
  };
  
  // Handle view devices
  const handleViewDevices = (deviceTypeCode: string) => {
    setSelectedDeviceType(deviceTypeCode);
    
    // Filter devices by type
    const deviceType = deviceTypes.find(dt => dt.code === deviceTypeCode);
    if (!deviceType) return;
    
    // Get all devices of this type
    const typeDevices = devices.filter(device => {
      const dt = deviceTypes.find(dt => dt.id === device.deviceTypeId);
      return dt?.code === deviceTypeCode;
    });
    
    // Filter to only show devices that are:
    // 1. Not allocated to any user (available for this provider to allocate)
    // 2. Allocated to users of this provider
    const providerDevices = typeDevices.filter(device => {
      // Include unallocated devices
      if (device.allocation === 'not allocated') {
        return true;
      }
      
      // Include devices allocated to this provider's users
      if (device.allocation === 'allocated' && device.allocatedTo) {
        // Check if the device is allocated to one of this provider's users
        return users.some(user => user.id === device.allocatedTo);
      }
      
      return false;
    });
    
    setFilteredDevices(providerDevices);
    setDeviceSearchTerm('');
    setIsDeviceListOpen(true);
  };
  
  // Filter devices by search term
  const getFilteredDeviceList = () => {
    let result = filteredDevices;
    
    // Apply allocation filter
    if (allocationFilter !== 'all') {
      result = result.filter(device => 
        allocationFilter === 'allocated' 
          ? device.allocation === 'allocated'
          : device.allocation === 'not allocated'
      );
    }
    
    // Apply search filter
    if (deviceSearchTerm) {
      const term = deviceSearchTerm.toLowerCase();
      result = result.filter(device => 
        device.id.toLowerCase().includes(term)
      );
    }
    
    return result;
  };
  
  // Get device type name
  const getDeviceTypeName = (deviceTypeId: string) => {
    const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
    return deviceType ? deviceType.name : deviceTypeId;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading device management...</span>
      </div>
    );
  }
  
  if (!provider) {
    return (
      <div className="container p-6 mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="py-10 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
              <h2 className="mb-2 text-xl font-semibold">Provider Not Found</h2>
              <p className="mb-4 text-muted-foreground">
                Your provider account could not be found. Please contact an administrator.
              </p>
              <Button onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
          <div>
          <h1 className="text-2xl font-bold">Device Management</h1>
          <p className="text-muted-foreground">
            Manage your devices by type
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/provider')}>
          Back to Dashboard
            </Button>
      </div>
      
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deviceTypes">Device Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Overview</CardTitle>
            <CardDescription>
                Summary of all devices available to you
            </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Device Types
                    </CardTitle>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{provider.deviceTypes.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Devices
                    </CardTitle>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {deviceTypeStats.reduce((sum, stat) => sum + stat.total, 0)}
          </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Allocated Devices
                    </CardTitle>
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {deviceTypeStats.reduce((sum, stat) => sum + stat.allocated, 0)}
                    </div>
                  </CardContent>
      </Card>
      
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Available Devices
                    </CardTitle>
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {deviceTypeStats.reduce((sum, stat) => sum + stat.available, 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deviceTypes">
          <DeviceTypeGrid
            deviceTypeCodes={provider.deviceTypes}
            deviceTypes={deviceTypes}
            devices={devices}
            users={users}
            onViewDevices={handleViewDevices}
            providerId={providerId || ''}
          />
        </TabsContent>
      </Tabs>
      
      {/* Device List Dialog */}
      <Dialog open={isDeviceListOpen} onOpenChange={setIsDeviceListOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {getDeviceTypeName(deviceTypes.find(dt => dt.code === selectedDeviceType)?.id || '')} Devices
            </DialogTitle>
            <DialogDescription>
              Available devices and devices allocated to your users
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search devices..."
                className="pl-8"
                  value={deviceSearchTerm}
                  onChange={(e) => setDeviceSearchTerm(e.target.value)}
              />
            </div>
          </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Filter:</span>
                <Select
                  value={allocationFilter}
                  onValueChange={(value) => setAllocationFilter(value as 'all' | 'allocated' | 'available')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by allocation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="allocated">Allocated Devices</SelectItem>
                    <SelectItem value="available">Available Devices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {getFilteredDeviceList().length} of {filteredDevices.length} devices
              </div>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Allocation</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Manufacturing Date</TableHead>
                    <TableHead>Valid Until</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredDeviceList().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No devices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredDeviceList().map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.id}</TableCell>
                      <TableCell>
                          <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                          {device.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                          <Badge variant={device.allocation === 'allocated' ? 'outline' : 'secondary'}>
                          {device.allocation}
                        </Badge>
                      </TableCell>
                        <TableCell>{getUserName(device.allocatedTo)}</TableCell>
                        <TableCell>{device.yearOfManufacturing}</TableCell>
                        <TableCell>{device.validity}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
                </div>
              </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeviceListOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}