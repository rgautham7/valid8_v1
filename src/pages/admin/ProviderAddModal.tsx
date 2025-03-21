import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Provider, DeviceType } from '../../types';
import { Checkbox } from '../../components/ui/checkbox';

interface ProviderAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: Provider) => void;
  provider?: Provider | null;
}

const ProviderAddModal: React.FC<ProviderAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  provider
}) => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [formData, setFormData] = useState<Provider>({
    id: '',
    name: '',
    hospital: '',
    licenseNumber: '',
    specialistIn: '',
    deviceTypes: [],
    usersCount: 0,
    mobileNo: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load device types from localStorage
  useEffect(() => {
    try {
      const storedDeviceTypes = localStorage.getItem('deviceTypes');
      if (storedDeviceTypes) {
        setDeviceTypes(JSON.parse(storedDeviceTypes));
      }
    } catch (error) {
      console.error('Error loading device types:', error);
    }
  }, []);
  
  // Initialize form data if editing
  useEffect(() => {
    if (provider) {
      setFormData({
        ...provider
      });
    } else {
      // Generate a unique ID for new provider
      const newId = `PRV_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setFormData({
        id: newId,
        name: '',
        hospital: '',
        licenseNumber: '',
        specialistIn: '',
        deviceTypes: [],
        usersCount: 0,
        mobileNo: ''
      });
    }
  }, [provider]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle device type selection
  const handleDeviceTypeChange = (deviceTypeCode: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        deviceTypes: [...formData.deviceTypes, deviceTypeCode]
      });
    } else {
      setFormData({
        ...formData,
        deviceTypes: formData.deviceTypes.filter(dt => dt !== deviceTypeCode)
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.hospital.trim()) {
      newErrors.hospital = 'Hospital is required';
    }
    
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }
    
    if (!formData.specialistIn.trim()) {
      newErrors.specialistIn = 'Specialization is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{provider ? 'Edit Provider' : 'Add Provider'}</DialogTitle>
          <DialogDescription>
            {provider 
              ? 'Update the provider details below.' 
              : 'Fill in the details to add a new provider.'}
          </DialogDescription>
          <Button 
            className="absolute right-4 top-4" 
            variant="ghost" 
            size="icon"
            onClick={onClose}
          >
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="id" className="text-right">
                ID
              </Label>
              <Input
                id="id"
                name="id"
                value={formData.id}
                className="col-span-3"
                disabled
              />
            </div>
            
            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter provider name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>
            
            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="hospital" className="text-right">
                Hospital
              </Label>
              <div className="col-span-3">
                <Input
                  id="hospital"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                />
                {errors.hospital && (
                  <p className="mt-1 text-sm text-red-500">{errors.hospital}</p>
                )}
              </div>
            </div>
            
            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="licenseNumber" className="text-right">
                License Number
              </Label>
              <div className="col-span-3">
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter license number"
                />
                {errors.licenseNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.licenseNumber}</p>
                )}
              </div>
            </div>
            
            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="specialistIn" className="text-right">
                Specialization
              </Label>
              <div className="col-span-3">
                <Input
                  id="specialistIn"
                  name="specialistIn"
                  value={formData.specialistIn}
                  onChange={handleChange}
                  placeholder="Enter specialization"
                />
                {errors.specialistIn && (
                  <p className="mt-1 text-sm text-red-500">{errors.specialistIn}</p>
                )}
              </div>
            </div>
            
            <div className="grid items-start grid-cols-4 gap-4">
              <Label className="pt-2 text-right">
                Device Types
              </Label>
              <div className="col-span-3 space-y-2">
                {deviceTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No device types available</p>
                ) : (
                  deviceTypes.map((deviceType) => (
                    <div key={deviceType.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`deviceType-${deviceType.id}`}
                        checked={formData.deviceTypes.includes(deviceType.code)}
                        onCheckedChange={(checked) => 
                          handleDeviceTypeChange(deviceType.code, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`deviceType-${deviceType.id}`}
                        className="text-sm font-normal"
                      >
                        {deviceType.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {provider && (
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="usersCount" className="text-right">
                  Users Count
                </Label>
                <Input
                  id="usersCount"
                  name="usersCount"
                  value={formData.usersCount}
                  className="col-span-3"
                  disabled
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {provider ? 'Update Provider' : 'Add Provider'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderAddModal;
