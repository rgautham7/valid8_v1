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
    age: 0,
    deviceTypes: [],
    usersCount: 0
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
        age: 0,
        deviceTypes: [],
        usersCount: 0
      });
    }
  }, [provider]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'age') {
      const ageValue = parseInt(value);
      setFormData({
        ...formData,
        [name]: isNaN(ageValue) ? 0 : ageValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
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
    
    if (formData.age <= 0) {
      newErrors.age = 'Age must be greater than 0';
    }
    
    if (formData.age > 100) {
      newErrors.age = 'Age must be less than or equal to 100';
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
            <X className="w-4 h-4" />
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
              <Label htmlFor="age" className="text-right">
                Age
              </Label>
              <div className="col-span-3">
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter provider age"
                  min="1"
                  max="100"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-500">{errors.age}</p>
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
