// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Cpu, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Loader2,
  Settings,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

// Utils
import { getFromStorage } from '../../utils/storageUtils';

// Types
import { Device, DeviceType, Provider } from '../../types';

// Stats interface
interface DeviceStats {
  total: number;
  active: number;
  inactive: number;
  allocated: number;
  available: number;
}

interface DeviceTypeStats extends DeviceStats {
  id: string;
  name: string;
  code: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  
  // State for data
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  // State for statistics
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    total: 0,
    active: 0,
    inactive: 0,
    allocated: 0,
    available: 0
  });
  
  const [deviceTypeStats, setDeviceTypeStats] = useState<DeviceTypeStats[]>([]);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/login/admin');
    }
  }, [isAuthenticated, userRole, navigate]);
  
  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      
      try {
        // Load device types
        const deviceTypesData = getFromStorage<DeviceType[]>('deviceTypes', []);
        setDeviceTypes(deviceTypesData);
        
        // Load devices
        const devicesData = getFromStorage<Device[]>('devices', []);
        setDevices(devicesData);
        
        // Load providers
        const providersData = getFromStorage<Provider[]>('providers', []);
        setProviders(providersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Calculate device statistics
  useEffect(() => {
    const calculateDeviceStats = () => {
      if (!devices || !deviceTypes) return;
      
      const totalDevices = devices.length;
      const activeDevices = devices.filter(device => device.status === 'active').length;
      const allocatedDevices = devices.filter(device => device.allocation === 'allocated').length;
      
      setDeviceStats({
        total: totalDevices,
        active: activeDevices,
        inactive: totalDevices - activeDevices,
        allocated: allocatedDevices,
        available: totalDevices - allocatedDevices
      });
      
      // Calculate stats for each device type
      const typeStats: DeviceTypeStats[] = deviceTypes.map(deviceType => {
        const typeDevices = devices.filter(device => device.deviceTypeId === deviceType.id);
        const totalTypeDevices = typeDevices.length;
        const activeTypeDevices = typeDevices.filter(device => device.status === 'active').length;
        const allocatedTypeDevices = typeDevices.filter(device => device.allocation === 'allocated').length;
        
        return {
          id: deviceType.id,
          name: deviceType.name,
          code: deviceType.code,
          total: totalTypeDevices,
          active: activeTypeDevices,
          inactive: totalTypeDevices - activeTypeDevices,
          allocated: allocatedTypeDevices,
          available: totalTypeDevices - allocatedTypeDevices
        };
      });
      
      setDeviceTypeStats(typeStats);
    };
    
    calculateDeviceStats();
  }, [devices, deviceTypes]);
  
  // Navigate to device management
  const handleManageDeviceTypes = () => {
    navigate('/admin/device-type-management');
  };
  
  // Navigate to provider management
  const handleManageProviders = () => {
    navigate('/admin/provider-management');
  };
  
  // Navigate to settings
  const handleSettings = () => {
    navigate('/admin/settings');
  };
  
  // Navigate to specific device type management
  const handleViewDeviceType = (deviceTypeId: string) => {
    navigate(`/admin/device-management/${deviceTypeId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Devices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Devices
            </CardTitle>
            <Cpu className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {deviceStats.active} active, {deviceStats.inactive} inactive
            </p>
          </CardContent>
        </Card>
        
        {/* Allocated Devices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Allocated Devices
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.allocated}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((deviceStats.allocated / deviceStats.total) * 100) || 0}% of total devices
            </p>
          </CardContent>
        </Card>
        
        {/* Available Devices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Available Devices
            </CardTitle>
            <XCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.available}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((deviceStats.available / deviceStats.total) * 100) || 0}% of total devices
            </p>
          </CardContent>
        </Card>
        
        {/* Providers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Providers
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
            <p className="text-xs text-muted-foreground">
              Managing {deviceStats.allocated} devices
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Device Type Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Device Type Management</CardTitle>
            <CardDescription>
              Manage device types in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              You have {deviceTypes.length} device types registered in the system.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleManageDeviceTypes} className="w-full">
              <Database className="w-4 h-4 mr-2" />
              Manage Device Types
            </Button>
          </CardFooter>
        </Card>
        
        {/* Provider Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Management</CardTitle>
            <CardDescription>
              Manage providers in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              You have {providers.length} providers registered in the system.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleManageProviders} className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Manage Providers
            </Button>
          </CardFooter>
        </Card>
        
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Configure global settings for the application.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSettings} className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </CardFooter>
        </Card>
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
                Summary of all devices in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Devices</span>
                  <span>{deviceStats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Devices</span>
                  <span>{deviceStats.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inactive Devices</span>
                  <span>{deviceStats.inactive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Allocated Devices</span>
                  <span>{deviceStats.allocated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available Devices</span>
                  <span>{deviceStats.available}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Provider Overview</CardTitle>
              <CardDescription>
                Summary of all providers in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Providers</span>
                  <span>{providers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Users</span>
                  <span>{providers.reduce((sum, provider) => sum + provider.usersCount, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deviceTypes">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deviceTypeStats.map((stats) => (
              <Card key={stats.id}>
                <CardHeader>
                  <CardTitle>{stats.name}</CardTitle>
                  <CardDescription>{stats.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Devices</span>
                      <span>{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Devices</span>
                      <span>{stats.active}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Allocated Devices</span>
                      <span>{stats.allocated}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Available Devices</span>
                      <span>{stats.available}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewDeviceType(stats.id)}
                  >
                    View Devices
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;