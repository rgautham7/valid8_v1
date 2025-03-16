// src/pages/admin/AddDeviceForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
  const [yearOfManufacturing, setYearOfManufacturing] = useState<string>('');
  const [validity, setValidity] = useState<string>('');
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedDeviceTypeId) {
      toast.error('Please select a device type');
      return;
    }
    
    if (!yearOfManufacturing) {
      toast.error('Please enter year of manufacturing');
      return;
    }
    
    if (!validity) {
      toast.error('Please enter validity');
      return;
    }
    
    try {
      // Generate a unique ID for the new device
      const selectedDeviceType = deviceTypes.find(dt => dt.id === selectedDeviceTypeId);
      
      if (!selectedDeviceType) {
        toast.error('Selected device type not found');
        return;
      }
      
      // Generate device ID based on device type code
      const prefix = selectedDeviceType.code.split('-').map(part => part.charAt(0).toUpperCase()).join('');
      
      // Get existing devices to determine the next ID number
      const existingDevices = getFromStorage<Device[]>('devices', []);
      const deviceTypeDevices = existingDevices.filter(d => d.deviceTypeId === selectedDeviceTypeId);
      const nextNumber = deviceTypeDevices.length + 1;
      const deviceId = `${prefix}_${nextNumber.toString().padStart(3, '0')}`;
      
      // Create new device
      const newDevice: Device = {
        id: deviceId,
        deviceTypeId: selectedDeviceTypeId,
        yearOfManufacturing,
        validity,
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
                <Label htmlFor="deviceType">Device Type *</Label>
                <Select 
                  value={selectedDeviceTypeId} 
                  onValueChange={setSelectedDeviceTypeId}
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
                <Label htmlFor="yearOfManufacturing">Year of Manufacturing *</Label>
                <Input
                  id="yearOfManufacturing"
                  type="text"
                  value={yearOfManufacturing}
                  onChange={(e) => setYearOfManufacturing(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validity">Validity *</Label>
                <Input
                  id="validity"
                  type="text"
                  value={validity}
                  onChange={(e) => setValidity(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
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
              
              <div className="flex justify-end space-x-2">
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