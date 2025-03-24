// src/pages/admin/AddDeviceForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Calendar as CalendarComponent } from "../../components/ui/calendar";
import { format } from "date-fns";
import Breadcrumb from '../../components/ui/breadcrumb';
import { DeviceType, Device } from '../../types/index';
import { getFromStorage, saveToStorage } from '../../utils/storageUtils';

const AddDeviceForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedDeviceTypeId = queryParams.get('deviceTypeId');
  
  // State
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState<string>('');
  const [deviceTypeId, setDeviceTypeId] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [yearOfManufacturing, setYearOfManufacturing] = useState<Date | undefined>(undefined);
  const [validity, setValidity] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load device types from localStorage
  useEffect(() => {
    const loadDeviceTypes = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const deviceTypesData = getFromStorage<DeviceType[]>('deviceTypes', []);
        setDeviceTypes(deviceTypesData);
        
        // If a device type ID was provided in the URL, preselect it
        if (preselectedDeviceTypeId) {
          setSelectedDeviceTypeId(preselectedDeviceTypeId);
          const deviceType = deviceTypesData.find(dt => dt.id === preselectedDeviceTypeId);
          if (deviceType) {
            setDeviceTypeId(deviceType.id || '');
            generateDeviceId(deviceType.code || '');
          }
        }
      } catch (err) {
        console.error('Error loading device types:', err);
        setError('Failed to load device types');
        toast.error('Failed to load device types');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDeviceTypes();
  }, [preselectedDeviceTypeId]);
  
  // Generate device ID based on the device type code
  const generateDeviceId = (code: string) => {
    try {
      if (!code) return;
      
      // Generate prefix from device type code
      const prefix = code.split('-').map(part => part.charAt(0).toUpperCase()).join('');
      
      // Get existing devices to determine the next ID number
      const existingDevices = getFromStorage<Device[]>('devices', []);
      const deviceTypeDevices = existingDevices.filter(d => {
        const dt = deviceTypes.find(type => type.id === d.deviceTypeId);
        return dt?.code === code;
      });
      
      const nextNumber = deviceTypeDevices.length + 1;
      const generatedId = `${prefix}_${nextNumber.toString().padStart(3, '0')}`;
      
      setDeviceId(generatedId);
    } catch (err) {
      console.error('Error generating device ID:', err);
    }
  };
  
  // Update deviceTypeCode and generate deviceId when selectedDeviceTypeId changes
  useEffect(() => {
    if (selectedDeviceTypeId) {
      const deviceType = deviceTypes.find(dt => dt.id === selectedDeviceTypeId);
      if (deviceType) {
        setDeviceTypeId(deviceType.id || '');
        generateDeviceId(deviceType.code || '');
      }
    } else {
      setDeviceTypeId('');
      setDeviceId('');
    }
  }, [selectedDeviceTypeId, deviceTypes]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedDeviceTypeId) {
      toast.error('Please select a device type');
      return;
    }
    
    if (!deviceId) {
      toast.error('Device ID is required');
      return;
    }
    
    if (!yearOfManufacturing) {
      toast.error('Please select year of manufacturing');
      return;
    }
    
    if (!validity) {
      toast.error('Please select validity');
      return;
    }
    
    try {
      // Check if the device ID already exists
      const existingDevices = getFromStorage<Device[]>('devices', []);
      const deviceExists = existingDevices.some(d => d.id === deviceId);
      
      if (deviceExists) {
        toast.error('A device with this ID already exists');
        return;
      }
      
      // Format dates to YYYY-MM-DD string
      const yearOfManufacturingStr = format(yearOfManufacturing, 'yyyy-MM-dd');
      const validityStr = format(validity, 'yyyy-MM-dd');
      
      // Create new device
      const newDevice: Device = {
        id: deviceId,
        deviceTypeId: selectedDeviceTypeId,
        yearOfManufacturing: yearOfManufacturingStr,
        validity: validityStr,
        status,
        allocation: 'not allocated',
        allocatedTo: undefined,
        lastUsedOn: undefined
      };
      
      // Add to localStorage
      const updatedDevices = [...existingDevices, newDevice];
      saveToStorage('devices', updatedDevices);
      
      // Show success message
      toast.success('Device added successfully');
      
      // Navigate back to device management
      navigate(`/admin/device-management/${selectedDeviceTypeId}`);
    } catch (err) {
      console.error('Error adding device:', err);
      toast.error('Failed to add device. Please try again.');
    }
  };
  
  const handleCancel = () => {
    if (selectedDeviceTypeId) {
      navigate(`/admin/device-management/${selectedDeviceTypeId}`);
    } else {
      navigate('/admin/device-type-management');
    }
  };
  
  const breadcrumbItems = [
    { title: 'Dashboard', path: '/admin' },
    { title: 'Device Types', path: '/admin/device-type-management' },
    { 
      title: deviceTypes.find(dt => dt.id === selectedDeviceTypeId)?.name || 'Devices', 
      path: selectedDeviceTypeId ? `/admin/device-management/${selectedDeviceTypeId}` : '/admin/device-type-management'
    },
    { title: 'Add Device', path: '/admin/add-device' }
  ];
  
  return (
    <div className="container p-6 mx-auto">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      
      <Card>
        <CardHeader>
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-2"
            onClick={handleCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <CardTitle className="text-2xl">Add New Device</CardTitle>
          <CardDescription>
            Create a new device in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 rounded-md bg-red-50">
              <p className="text-red-800">{error}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type <span className="text-red-500">*</span></Label>
                <Select 
                  value={selectedDeviceTypeId} 
                  onValueChange={(value) => {
                    setSelectedDeviceTypeId(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.length === 0 ? (
                      <SelectItem value="no-device-types" disabled>
                        No device types available
                      </SelectItem>
                    ) : (
                      deviceTypes.map((deviceType) => (
                        <SelectItem key={deviceType.id} value={deviceType.id}>
                          {deviceType.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {deviceTypes.length === 0 && (
                  <p className="text-sm text-amber-600">
                    No device types found. Please add a device type first.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceTypeId">Device Type Id</Label>
                <Input
                  id="deviceTypeId"
                  type="text"
                  value={deviceTypeId}
                  readOnly
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">
                  This ID is derived from the selected device type
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceId">Device ID <span className="text-red-500">*</span></Label>
                <Input
                  id="deviceId"
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Enter device ID"
                  required
                />
                <p className="text-xs text-gray-500">
                  Auto-generated ID that can be modified if needed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearOfManufacturing">Year of Manufacturing <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !yearOfManufacturing && "text-muted-foreground"
                      }`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {yearOfManufacturing ? format(yearOfManufacturing, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={yearOfManufacturing}
                      onSelect={setYearOfManufacturing}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validity">Validity <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !validity && "text-muted-foreground"
                      }`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {validity ? format(validity, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={validity}
                      onSelect={setValidity}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <Select 
                  value={status} 
                  onValueChange={(value: 'active' | 'inactive') => setStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Device
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDeviceForm;