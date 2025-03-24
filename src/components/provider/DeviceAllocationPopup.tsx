import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Search, AlertCircle, PlusCircle, Loader2 } from 'lucide-react';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Types
import { User, Device, DeviceType, UserDevice } from '../../types';

interface DeviceAllocationPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  providerId: string;
  providerDeviceTypes: string[];
  deviceTypes: DeviceType[];
  onDeviceAllocated: (updatedUser: User) => void;
}

const DeviceAllocationPopup: React.FC<DeviceAllocationPopupProps> = ({
  isOpen,
  onOpenChange,
  user,
  providerId,
  providerDeviceTypes,
  deviceTypes,
  onDeviceAllocated
}) => {
  // State
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDeviceType('');
      setAvailableDevices([]);
      setDeviceSearchTerm('');
      setSelectedDevice(null);
    }
  }, [isOpen]);

  // Get device type name
  const getDeviceTypeName = (code: string) => {
    const deviceType = deviceTypes.find(dt => dt.code === code);
    return deviceType ? deviceType.name : code;
  };

  // Load available devices for the selected device type
  const loadAvailableDevices = (deviceTypeCode: string) => {
    try {
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) {
        toast.error('Device data not available');
        return;
      }
      
      const allDevices: Device[] = JSON.parse(devicesData);
      
      // Filter devices by type and availability
      const availableDevicesOfType = allDevices.filter(device => {
        const deviceType = deviceTypes.find(dt => dt.id === device.deviceTypeId);
        return deviceType?.code === deviceTypeCode && 
               device.status === 'active' && 
               device.allocation === 'not allocated';
      });
      
      setAvailableDevices(availableDevicesOfType);
    } catch (error) {
      console.error('Error loading available devices:', error);
      toast.error('Failed to load available devices');
    }
  };

  // Filter available devices by search term
  const getFilteredAvailableDevices = () => {
    // Initial filtering by provider allocation
    const providerDevices = availableDevices.filter(device =>
      device.providerAllocation === providerId
    );
    
    // Then apply search filter
    if (!deviceSearchTerm) return providerDevices;
    
    const term = deviceSearchTerm.toLowerCase();
    return providerDevices.filter(device => 
      device.id.toLowerCase().includes(term)
    );
  };

  // Handle device allocation
  const handleAllocateDevice = async (device: Device) => {
    setSelectedDevice(device);
    setIsProcessing(true);
    
    try {
      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];
      
      // 1. Update user's devices
      const usersData = localStorage.getItem('users');
      if (!usersData) {
        throw new Error('User data not available');
      }
      
      const allUsers: User[] = JSON.parse(usersData);
      
      // Find device type code
      const deviceTypeData = deviceTypes.find(dt => dt.id === device.deviceTypeId);
      if (!deviceTypeData) {
        throw new Error('Device type not found');
      }
      
      // Create new device entry for user
      const newUserDevice: UserDevice = {
        deviceId: device.id,
        deviceType: deviceTypeData.code,
        allocatedOn: currentDate,
        lastUsedOn: currentDate
      };
      
      // Update user's devices array
      const updatedUsers = allUsers.map(u => 
        u.id === user.id 
          ? { ...u, devices: [...u.devices, newUserDevice] } 
          : u
      );
      
      // 2. Update device allocation status
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) {
        throw new Error('Device data not available');
      }
      
      const allDevices: Device[] = JSON.parse(devicesData);
      const updatedDevices = allDevices.map(d => 
        d.id === device.id 
          ? { 
              ...d, 
              allocation: 'allocated', 
              allocatedTo: user.id,
              lastUsedOn: currentDate
            } 
          : d
      );
      
      // Save updates to localStorage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('devices', JSON.stringify(updatedDevices));
      
      // Find updated user
      const updatedUser = updatedUsers.find(u => u.id === user.id);
      if (!updatedUser) {
        throw new Error('Updated user not found');
      }
      
      // Call the callback with the updated user
      onDeviceAllocated(updatedUser);
      
      // Close the dialog
      onOpenChange(false);
      
      toast.success(`Device ${device.id} allocated to ${user.name}`);
    } catch (error) {
      console.error('Error allocating device:', error);
      toast.error('Failed to allocate device');
    } finally {
      setIsProcessing(false);
      setSelectedDevice(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Allocate Device</DialogTitle>
          <DialogDescription>
            Allocate a device to {user.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="deviceType">Device Type</Label>
            <Select
              value={selectedDeviceType}
              onValueChange={(value) => {
                setSelectedDeviceType(value);
                loadAvailableDevices(value);
              }}
            >
              <SelectTrigger id="deviceType">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {providerDeviceTypes.map(code => (
                  <SelectItem key={code} value={code}>
                    {getDeviceTypeName(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedDeviceType && (
            <>
              <div className="space-y-2">
                <Label htmlFor="deviceSearch">Search Devices</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="deviceSearch"
                    placeholder="Search by device ID..."
                    className="pl-8"
                    value={deviceSearchTerm}
                    onChange={(e) => setDeviceSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto border rounded-md max-h-60">
                {getFilteredAvailableDevices().length === 0 ? (
                  <div className="p-4 text-center">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No available devices of this type
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device ID</TableHead>
                        <TableHead>Manufacturing Date</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredAvailableDevices().map((device) => (
                        <TableRow key={device.id}>
                          <TableCell className="font-medium">{device.id}</TableCell>
                          <TableCell>{device.yearOfManufacturing}</TableCell>
                          <TableCell>{device.validity}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAllocateDevice(device)}
                              disabled={isProcessing && selectedDevice?.id === device.id}
                            >
                              {isProcessing && selectedDevice?.id === device.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <PlusCircle className="w-4 h-4 mr-1" />
                              )}
                              Allocate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceAllocationPopup; 