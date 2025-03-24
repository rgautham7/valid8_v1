import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Device, DeviceType, Provider } from '../../types';
import { toast } from 'react-hot-toast';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Info, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';

interface DeviceAllocationToProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  onAllocationComplete: (updatedProvider: Provider) => void;
}

const DeviceAllocationToProviderModal: React.FC<DeviceAllocationToProviderModalProps> = ({
  isOpen,
  onClose,
  providerId,
  onAllocationComplete,
}) => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("");
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [providerDeviceTypes, setProviderDeviceTypes] = useState<string[]>([]);

  // Load provider data, device types, and available devices
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        // Load provider
        const providersData = localStorage.getItem('providers');
        if (!providersData) {
          toast.error('Provider data not available');
          return;
        }

        const providers: Provider[] = JSON.parse(providersData);
        const currentProvider = providers.find(p => p.id === providerId);
        if (!currentProvider) {
          toast.error('Provider not found');
          return;
        }
        setProvider(currentProvider);
        setProviderDeviceTypes(currentProvider.deviceTypes || []);

        // Load device types
        const deviceTypesData = localStorage.getItem('deviceTypes');
        if (!deviceTypesData) {
          toast.error('Device types data not available');
          return;
        }
        const allDeviceTypes: DeviceType[] = JSON.parse(deviceTypesData);
        // Filter device types to only include those assigned to the provider
        const filteredDeviceTypes = allDeviceTypes.filter(dt => 
          currentProvider.deviceTypes.includes(dt.code)
        );
        setDeviceTypes(filteredDeviceTypes);

        // Load all devices
        const devicesData = localStorage.getItem('devices');
        if (!devicesData) {
          toast.error('Devices data not available');
          return;
        }
        const allDevices: Device[] = JSON.parse(devicesData);
        setDevices(allDevices);

        // Initialize selected devices from provider's already allocated devices
        if (currentProvider.allocatedDevices) {
          setSelectedDevices(currentProvider.allocatedDevices);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, providerId]);

  // Filter available devices when device type changes
  useEffect(() => {
    if (!selectedDeviceType || !deviceTypes.length) return;

    const selectedTypeObj = deviceTypes.find(dt => dt.code === selectedDeviceType);
    if (!selectedTypeObj) return;

    // Filter devices by selected device type and those not already allocated to another provider
    const filtered = devices.filter(device => {
      // Device matches the selected type
      const matchesType = device.deviceTypeId === selectedTypeObj.id;
      
      // Device is either unallocated to a provider or already allocated to this provider
      const isAvailable = !device.providerAllocation || device.providerAllocation === providerId;
      
      return matchesType && isAvailable;
    });

    setAvailableDevices(filtered);
  }, [selectedDeviceType, devices, deviceTypes, providerId]);

  // Further filter the available devices by search query
  const filteredDevices = availableDevices.filter(device => {
    if (!searchQuery) return true;
    return device.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle device type selection
  const handleDeviceTypeChange = (value: string) => {
    setSelectedDeviceType(value);
    setSearchQuery("");
  };

  // Handle device selection
  const handleDeviceSelection = (deviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices(prev => [...prev, deviceId]);
    } else {
      setSelectedDevices(prev => prev.filter(id => id !== deviceId));
    }
  };

  // Get device type name from code
  const getDeviceTypeName = (code: string) => {
    const deviceType = deviceTypes.find(dt => dt.code === code);
    return deviceType ? deviceType.name : code;
  };

  // Check if a device is already allocated to this provider
  const isDeviceAllocatedToProvider = (deviceId: string) => {
    if (!provider?.allocatedDevices) return false;
    return provider.allocatedDevices.includes(deviceId);
  };

  // Handle allocation of selected devices
  const handleAllocateDevices = () => {
    try {
      if (!provider) {
        toast.error('Provider not found');
        return;
      }

      // Get all providers from localStorage
      const providersData = localStorage.getItem('providers');
      if (!providersData) {
        toast.error('Provider data not available');
        return;
      }
      const providers: Provider[] = JSON.parse(providersData);

      // Get all devices from localStorage
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) {
        toast.error('Devices data not available');
        return;
      }
      const allDevices: Device[] = JSON.parse(devicesData);

      // Check if any selected device is allocated to a user but not to this provider
      // This should not happen as these should be filtered out, but we check as a precaution
      const invalidDevice = allDevices.find(device => 
        selectedDevices.includes(device.id) && 
        device.allocation === 'allocated' && 
        device.providerAllocation !== providerId
      );

      if (invalidDevice) {
        toast.error(`Device ${invalidDevice.id} is allocated to a user and cannot be allocated to this provider.`);
        return;
      }

      // Update provider's allocated devices
      const updatedProviders = providers.map(p => {
        if (p.id === providerId) {
          return {
            ...p,
            allocatedDevices: selectedDevices
          };
        }
        return p;
      });

      // Update devices' provider allocation
      const updatedDevices = allDevices.map(device => {
        // If device is in selectedDevices, allocate to this provider
        if (selectedDevices.includes(device.id)) {
          return {
            ...device,
            providerAllocation: providerId
          };
        }
        // If device was allocated to this provider but is no longer selected AND is not allocated to a user, deallocate
        else if (device.providerAllocation === providerId && device.allocation !== 'allocated') {
          return {
            ...device,
            providerAllocation: undefined
          };
        }
        return device;
      });

      // Save updates to localStorage
      localStorage.setItem('providers', JSON.stringify(updatedProviders));
      localStorage.setItem('devices', JSON.stringify(updatedDevices));

      // Find the updated provider
      const updatedProvider = updatedProviders.find(p => p.id === providerId);
      if (updatedProvider) {
        onAllocationComplete(updatedProvider);
      }

      toast.success('Devices allocated successfully');
      onClose();
    } catch (error) {
      console.error('Error allocating devices:', error);
      toast.error('Failed to allocate devices');
    }
  };

  // Toggle select all visible devices
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = [...selectedDevices];
      filteredDevices.forEach(device => {
        if (!newSelected.includes(device.id)) {
          newSelected.push(device.id);
        }
      });
      setSelectedDevices(newSelected);
    } else {
      // Only deselect the visible/filtered devices
      const filteredIds = filteredDevices.map(d => d.id);
      setSelectedDevices(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  // Check if all visible devices are selected
  const areAllVisible = filteredDevices.length > 0 && 
    filteredDevices.every(device => selectedDevices.includes(device.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Allocate Devices to Provider</DialogTitle>
          <DialogDescription>
            Select devices to allocate to {provider?.name || 'provider'}.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
            <div className="mb-4 space-y-4">
              <div>
                <Label htmlFor="device-type">Device Type</Label>
                <Select 
                  value={selectedDeviceType} 
                  onValueChange={handleDeviceTypeChange}
                >
                  <SelectTrigger id="device-type">
                    <SelectValue placeholder="Select a device type" />
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
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search devices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  
                  <div className="border rounded-md overflow-y-auto max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox 
                              checked={areAllVisible}
                              onCheckedChange={handleSelectAll}
                              disabled={filteredDevices.length === 0}
                              aria-label="Select all devices"
                            />
                          </TableHead>
                          <TableHead>Device ID</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Validity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Allocation</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDevices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="py-6 text-center">
                              No devices available for this device type
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDevices.map((device) => {
                            // Check if device is allocated to a user
                            const isAllocatedToUser = device.allocation === 'allocated';
                            // Check if device is already allocated to this provider
                            const isAllocatedToThisProvider = device.providerAllocation === providerId;

                            return (
                              <TableRow 
                                key={device.id}
                                className={isAllocatedToUser ? "bg-orange-50" : isAllocatedToThisProvider ? "bg-blue-50" : ""}
                              >
                                <TableCell>
                                  <Checkbox 
                                    checked={selectedDevices.includes(device.id)}
                                    onCheckedChange={(checked) => 
                                      handleDeviceSelection(device.id, !!checked)
                                    }
                                    aria-label={`Select device ${device.id}`}
                                  />
                                </TableCell>
                                <TableCell>{device.id}</TableCell>
                                <TableCell>{device.yearOfManufacturing}</TableCell>
                                <TableCell>{device.validity}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    device.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {device.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {isAllocatedToUser ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      Allocated to user
                                    </span>
                                  ) : isAllocatedToThisProvider ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Allocated to this provider
                                    </span>
                                  ) : device.providerAllocation ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      Allocated to another provider
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Available
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isAllocatedToUser && (
                                    <div className="text-xs text-gray-500">
                                      Cannot deallocate (in use)
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Info className="w-4 h-4" />
                    <span>
                      {selectedDevices.length} device(s) selected
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAllocateDevices} 
            disabled={loading || selectedDevices.length === 0}
          >
            Allocate Selected Devices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceAllocationToProviderModal; 