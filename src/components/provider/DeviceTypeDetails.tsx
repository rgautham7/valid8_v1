import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  Smartphone, 
  Users,
  ArrowRight
} from 'lucide-react';

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
import { Badge } from "../../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

// Types
import { DeviceType, Device, User } from '../../types';

interface DeviceTypeDetailsProps {
  deviceTypeCode: string;
  deviceTypes: DeviceType[];
  devices: Device[];
  users: User[];
  onViewDevices: (deviceTypeCode: string) => void;
  providerId: string;
}

interface DeviceTypeStats {
  total: number;
  active: number;
  inactive: number;
  allocated: number;
  available: number;
  usersWithDevice: number;
}

const DeviceTypeDetails: React.FC<DeviceTypeDetailsProps> = ({
  deviceTypeCode,
  deviceTypes,
  devices,
  users,
  onViewDevices,
  providerId
}) => {
  const [stats, setStats] = useState<DeviceTypeStats>({
    total: 0,
    active: 0,
    inactive: 0,
    allocated: 0,
    available: 0,
    usersWithDevice: 0
  });
  
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  
  // Calculate statistics for this device type
  useEffect(() => {
    if (!deviceTypeCode || !deviceTypes.length || !devices.length) return;
    
    try {
      // Find the device type
      const foundDeviceType = deviceTypes.find(dt => dt.code === deviceTypeCode);
      if (!foundDeviceType) {
        toast.error(`Device type ${deviceTypeCode} not found`);
        return;
      }
      
      setDeviceType(foundDeviceType);
      
      // Find all devices of this type
      const typeDevices = devices.filter(device => {
        const dt = deviceTypes.find(dt => dt.id === device.deviceTypeId);
        return dt?.code === deviceTypeCode;
      });
      
      // Filter to only include devices that are:
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
      
      const totalDevices = providerDevices.length;
      const activeDevices = providerDevices.filter(device => device.status === 'active').length;
      const allocatedDevices = providerDevices.filter(device => device.allocation === 'allocated').length;
      
      // Count users with this device type
      const usersWithThisDeviceType = users.filter(user => 
        user.devices.some(device => device.deviceType === deviceTypeCode)
      ).length;
      
      setStats({
        total: totalDevices,
        active: activeDevices,
        inactive: totalDevices - activeDevices,
        allocated: allocatedDevices,
        available: totalDevices - allocatedDevices,
        usersWithDevice: usersWithThisDeviceType
      });
      
    } catch (error) {
      console.error('Error calculating device type statistics:', error);
      toast.error('Failed to calculate device statistics');
    }
  }, [deviceTypeCode, deviceTypes, devices, users, providerId]);
  
  if (!deviceType) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-10 text-center">
            <Info className="w-10 h-10 mx-auto mb-4 text-amber-500" />
            <h2 className="mb-2 text-xl font-semibold">Device Type Not Found</h2>
            <p className="mb-4 text-muted-foreground">
              The requested device type could not be found.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{deviceType.name}</CardTitle>
            <CardDescription>{deviceType.code}</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="px-3 py-1">
                  <Smartphone className="w-3.5 h-3.5 mr-1" />
                  {stats.total} devices
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total devices of this type</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid gap-4 mb-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />
                Active Devices
              </span>
              <span className="font-medium">{stats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm font-medium">
                <XCircle className="w-4 h-4 mr-1.5 text-red-500" />
                Inactive Devices
              </span>
              <span className="font-medium">{stats.inactive}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm font-medium">
                <Users className="w-4 h-4 mr-1.5 text-blue-500" />
                Allocated Devices
              </span>
              <span className="font-medium">{stats.allocated}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm font-medium">
                <Smartphone className="w-4 h-4 mr-1.5 text-gray-500" />
                Available Devices
              </span>
              <span className="font-medium">{stats.available}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 mt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Users with this device type:</span>
            <span className="font-medium">{stats.usersWithDevice}</span>
          </div>
        </div>
        
        {deviceType.manufacturer && (
          <div className="pt-2 mt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Manufacturer:</span>
              <span>{deviceType.manufacturer}</span>
            </div>
          </div>
        )}
        
        {deviceType.countryOfOrigin && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium">Country of Origin:</span>
            <span>{deviceType.countryOfOrigin}</span>
          </div>
        )}
        
        {deviceType.parameters && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium">Parameters:</span>
            <span>{deviceType.parameters}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between bg-muted/30">
        <div className="text-sm text-muted-foreground">
          {stats.available > 0 ? (
            <span className="text-green-600">{stats.available} devices available for allocation</span>
          ) : (
            <span className="text-amber-600">No devices available for allocation</span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDevices(deviceTypeCode)}
        >
          View Devices
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeviceTypeDetails; 