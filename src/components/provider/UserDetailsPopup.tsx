import React, { useState, useEffect } from 'react';
import { User as UserType, Device, DeviceType } from '../../types';
import { 
  User, X, Activity, Calendar, Clock, Smartphone, 
  ToggleLeft, ToggleRight, Mail, Phone, AlertTriangle,
  Trash2, Plus
} from 'lucide-react';
import { getUserDevices } from '../../utils/deviceUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface UserDetailsPopupProps {
  user: UserType;
  onClose: () => void;
  onToggleActivity: (userId: string) => void;
}

// Form validation schema for device allocation
const allocationFormSchema = z.object({
  deviceTypeCode: z.string().min(1, "Device type is required"),
  deviceId: z.string().min(1, "Device is required")
});

type AllocationFormValues = z.infer<typeof allocationFormSchema>;

const UserDetailsPopup: React.FC<UserDetailsPopupProps> = ({ 
  user, 
  onClose,
  onToggleActivity 
}) => {
  // Get user's devices with full details
  const userDevices = getUserDevices(user.id);
  
  // State for alert dialogs
  const [showDeallocationConfirm, setShowDeallocationConfirm] = useState(false);
  const [showInactivationConfirm, setShowInactivationConfirm] = useState(false);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [selectedDeviceToRemove, setSelectedDeviceToRemove] = useState<string | null>(null);
  
  // State for device allocation
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [deviceTypeSelected, setDeviceTypeSelected] = useState(false);
  const [providerDeviceTypes, setProviderDeviceTypes] = useState<string[]>([]);
  const [providerId, setProviderId] = useState<string>(user.providerId);
  
  // Setup form for device allocation
  const allocationForm = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: {
      deviceTypeCode: "",
      deviceId: ""
    }
  });
  
  // Watch for device type changes
  const selectedDeviceType = allocationForm.watch("deviceTypeCode");
  
  // Load device types and available devices on component mount
  useEffect(() => {
    loadDeviceTypes();
    loadAvailableDevices();
  }, []);
  
  // Load device types
  const loadDeviceTypes = () => {
    try {
      // Load provider data to get device types
      const providersData = localStorage.getItem('providers');
      if (!providersData) {
        toast.error("Provider data not available");
        return;
      }
      
      const providers = JSON.parse(providersData);
      const currentProvider = providers.find((p: any) => p.id === user.providerId);
      
      if (!currentProvider) {
        toast.error("Provider not found");
        return;
      }
      
      setProviderDeviceTypes(currentProvider.deviceTypes || []);
      
      // Load device types
      const deviceTypesData = localStorage.getItem('deviceTypes');
      if (deviceTypesData) {
        const allDeviceTypes: DeviceType[] = JSON.parse(deviceTypesData);
        const providerDeviceTypes = allDeviceTypes.filter(dt => 
          currentProvider.deviceTypes.includes(dt.code)
        );
        setDeviceTypes(providerDeviceTypes);
      }
    } catch (error) {
      console.error('Error loading device types:', error);
      toast.error('Failed to load device types');
    }
  };
  
  // Load all available devices
  const loadAvailableDevices = () => {
    try {
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) {
        toast.error("Device data not available");
        return;
      }

      const allDevices: Device[] = JSON.parse(devicesData);
      
      // Filter devices that are:
      // 1. Allocated to this provider (providerAllocation matches user's providerId)
      // 2. Either not allocated to any user OR inactive
      const availDevices = allDevices.filter(device => {
        const isAllocatedToProvider = device.providerAllocation === user.providerId;
        const isAvailableForUser = device.allocation === 'not allocated' || device.status === 'inactive';
        
        return isAllocatedToProvider && isAvailableForUser;
      });
      
      setAvailableDevices(availDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
      toast.error('Failed to load devices');
    }
  };
  
  // Update filtered devices when device type changes
  useEffect(() => {
    if (selectedDeviceType) {
      setDeviceTypeSelected(true);
      
      // Find the device type object by code
      const selectedTypeObj = deviceTypes.find(dt => dt.code === selectedDeviceType);
      
      if (selectedTypeObj) {
        // Filter devices that match the selected device type ID and are either:
        // 1. Not allocated and active, OR
        // 2. Inactive (regardless of allocation)
        const filtered = availableDevices.filter(device => {
          return device.deviceTypeId === selectedTypeObj.id && 
                (device.allocation === 'not allocated' || device.status === 'inactive');
        });
        
        setFilteredDevices(filtered);
      } else {
        setFilteredDevices([]);
      }
      
      // Reset device ID when device type changes
      allocationForm.setValue('deviceId', "");
    } else {
      setDeviceTypeSelected(false);
      setFilteredDevices([]);
    }
  }, [selectedDeviceType, availableDevices, deviceTypes, allocationForm]);
  
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
  
  // Handle device deallocation
  const handleDeallocateDevice = (deviceId: string) => {
    setSelectedDeviceToRemove(deviceId);
    setShowDeallocationConfirm(true);
  };
  
  // Handle allocation dialog open
  const handleAllocateDevice = () => {
    // Reset form when opening the dialog
    allocationForm.reset({
      deviceTypeCode: "",
      deviceId: ""
    });
    setDeviceTypeSelected(false);
    setFilteredDevices([]);
    
    // Refresh device data
    loadDeviceTypes();
    loadAvailableDevices();
    
    setShowAllocationDialog(true);
  };
  
  // Handle user inactivation
  const handleToggleActivity = () => {
    // If user is already inactive, we can simply activate them
    if (user.activity !== 'Active') {
      onToggleActivity(user.id);
      return;
    }
    
    // If user is active and has devices, show confirmation
    if (user.devices.length > 0) {
      setShowInactivationConfirm(true);
    } else {
      // If no devices, simply toggle
      onToggleActivity(user.id);
    }
  };
  
  // Add this function to refresh all user data from localStorage
  const refreshUserData = () => {
    try {
      const usersData = localStorage.getItem('users');
      if (!usersData) return;
      
      const allUsers: UserType[] = JSON.parse(usersData);
      const updatedUserData = allUsers.find(u => u.id === user.id);
      
      if (updatedUserData) {
        // Update all user properties
        Object.assign(user, updatedUserData);
      }
      
      // Also refresh user devices with full details
      const refreshedDevices = getUserDevices(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };
  
  // Submit allocation form
  const onSubmitAllocation = (values: AllocationFormValues) => {
    try {
      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Find selected device
      const selectedDevice = availableDevices.find(d => d.id === values.deviceId);
      if (!selectedDevice) {
        toast.error("Selected device not found");
        return;
      }
      
      // 1. Update user's devices array
      const usersData = localStorage.getItem('users');
      if (!usersData) {
        toast.error("User data not available");
        return;
      }
      
      const allUsers: UserType[] = JSON.parse(usersData);
      const updatedUsers = allUsers.map(u => {
        if (u.id === user.id) {
          // Create new device entry
          const newUserDevice = {
            deviceId: selectedDevice.id,
            deviceType: values.deviceTypeCode,
            allocatedOn: currentDate,
            lastUsedOn: currentDate
          };
          
          return {
            ...u,
            devices: [...u.devices, newUserDevice]
          };
        }
        return u;
      });
      
      // 2. Update device allocation status
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) {
        toast.error("Device data not available");
        return;
      }
      
      const allDevices: Device[] = JSON.parse(devicesData);
      const updatedDevices = allDevices.map(d => {
        if (d.id === selectedDevice.id) {
          return {
            ...d,
            status: 'active', // Set status to active
            allocation: 'allocated',
            allocatedTo: user.id,
            lastUsedOn: currentDate
          };
        }
        return d;
      });
      
      // 3. Save updates to localStorage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('devices', JSON.stringify(updatedDevices));
      
      // 4. Update the local user object for UI refresh
      const newUserDevice = {
        deviceId: selectedDevice.id,
        deviceType: values.deviceTypeCode,
        allocatedOn: currentDate,
        lastUsedOn: currentDate
      };
      
      // Update the user object directly so UI reflects changes
      user.devices = [...user.devices, newUserDevice];
      
      // Refresh user devices to update the details displayed in the table
      const refreshedDevices = getUserDevices(user.id);
      
      toast.success(`Device ${selectedDevice.id} has been allocated`);
      setShowAllocationDialog(false);
      
      // Refresh available devices
      loadAvailableDevices();
      
    } catch (error) {
      console.error('Error allocating device:', error);
      toast.error('Failed to allocate device');
    }
  };
  
  // Confirm device deallocation
  const confirmDeallocateDevice = () => {
    if (!selectedDeviceToRemove) return;
    
    try {
      // 1. Update user's devices array
      const usersData = localStorage.getItem('users');
      if (!usersData) {
        toast.error("User data not available");
        return;
      }
      
      const allUsers: UserType[] = JSON.parse(usersData);
      const updatedUsers = allUsers.map(u => {
        if (u.id === user.id) {
          return {
            ...u,
            devices: u.devices.filter(d => d.deviceId !== selectedDeviceToRemove)
          };
        }
        return u;
      });
      
      // 2. Update device allocation status
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) {
        toast.error("Device data not available");
        return;
      }
      
      const allDevices: Device[] = JSON.parse(devicesData);
      const updatedDevices = allDevices.map(d => {
        if (d.id === selectedDeviceToRemove) {
          return {
            ...d,
            allocation: 'not allocated',
            allocatedTo: undefined
          };
        }
        return d;
      });
      
      // 3. Save updates to localStorage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('devices', JSON.stringify(updatedDevices));
      
      // 4. Update the local user object for UI refresh
      user.devices = user.devices.filter(d => d.deviceId !== selectedDeviceToRemove);
      
      // After saving updates to localStorage
      refreshUserData();
      
      toast.success(`Device ${selectedDeviceToRemove} has been deallocated`);
      setShowDeallocationConfirm(false);
      
      // Refresh available devices
      loadAvailableDevices();
      
    } catch (error) {
      console.error('Error deallocating device:', error);
      toast.error('Failed to deallocate device');
    }
  };

  // Add this useEffect 
  useEffect(() => {
    // This will ensure userDevices is always up to date with the current user.devices
    const refreshedDevices = getUserDevices(user.id);
  }, [user.devices]);

  // Alternatively, consider storing userDevices in state to have more control
  const [userDevicesWithDetails, setUserDevicesWithDetails] = useState<Device[]>([]);

  useEffect(() => {
    const refreshedDevices = getUserDevices(user.id);
    setUserDevicesWithDetails(refreshedDevices);
  }, [user.devices]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl p-6 mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
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
              onClick={handleToggleActivity}
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
                <Activity className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Usage Frequency</p>
                  <p className="text-sm text-gray-600">{user.frequency || 'Not specified'}</p>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Assigned Devices</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAllocateDevice}
              className="flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Allocate Device
            </Button>
          </div>
          
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
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.devices.map((device, index) => {
                    // Find full device details
                    const fullDevice = userDevicesWithDetails.find(d => d.id === device.deviceId);
                    
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
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeallocateDevice(device.deviceId)}
                            className="flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Deallocate
                          </Button>
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
      
      {/* Device Deallocation Confirmation Dialog */}
      <AlertDialog open={showDeallocationConfirm} onOpenChange={setShowDeallocationConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Device Deallocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deallocate device <strong>{selectedDeviceToRemove}</strong> from this user?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="text-white bg-red-600 hover:bg-red-700"
              onClick={confirmDeallocateDevice}
            >
              Deallocate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* User Inactivation Confirmation Dialog */}
      <AlertDialog open={showInactivationConfirm} onOpenChange={setShowInactivationConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-amber-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Warning: User has assigned devices
            </AlertDialogTitle>
            <AlertDialogDescription>
              This user has {user.devices.length} device(s) assigned to them. 
              It is recommended to deallocate all devices before setting the user to inactive.
              <ul className="mt-2 ml-5 list-disc">
                {user.devices.map(device => (
                  <li key={device.deviceId}>{device.deviceId} ({device.deviceType})</li>
                ))}
              </ul>
              <p className="mt-2 font-medium">Do you still want to set this user to inactive?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="text-white bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                setShowInactivationConfirm(false);
                onToggleActivity(user.id);
              }}
            >
              Set Inactive Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Device Allocation Dialog */}
      <Dialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Allocate Device to {user.name}</DialogTitle>
            <DialogDescription>
              Select a device type and device to allocate to this user.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...allocationForm}>
            <form onSubmit={allocationForm.handleSubmit(onSubmitAllocation)} className="space-y-4">
              {/* Device Type Selection */}
              <FormField
                control={allocationForm.control}
                name="deviceTypeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a device type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providerDeviceTypes.map(code => {
                          const deviceType = deviceTypes.find(dt => dt.code === code);
                          return (
                            <SelectItem key={code} value={code}>
                              {deviceType?.name || code}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Device Selection */}
              <FormField
                control={allocationForm.control}
                name="deviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!deviceTypeSelected}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={deviceTypeSelected ? "Select a device" : "Select device type first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredDevices.length > 0 ? (
                          filteredDevices.map(device => {
                            const deviceType = deviceTypes.find(dt => dt.id === device.deviceTypeId);
                            const deviceStatus = device.status === 'inactive' ? ' (Inactive)' : '';
                            return (
                              <SelectItem key={device.id} value={device.id}>
                                {device.id} - {deviceType?.name || device.deviceTypeId}{deviceStatus}
                              </SelectItem>
                            );
                          })
                        ) : (
                          deviceTypeSelected && 
                          <SelectItem disabled value="no-devices">
                            No available devices of this type
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {deviceTypeSelected && filteredDevices.length === 0 && (
                      <p className="mt-1 text-sm text-amber-500">
                        No available devices for this device type
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Dialog Actions */}
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={!allocationForm.formState.isValid || filteredDevices.length === 0}
                >
                  Allocate Device
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetailsPopup;
