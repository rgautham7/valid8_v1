import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Check, Clock, Calendar } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { User, UserDevice } from '../../types/index';

interface AddUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUsage: (deviceIds: string[], timestamp: string) => void;
  userData: User | null;
  preselectedDeviceId?: string;
}

const AddUsageModal: React.FC<AddUsageModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddUsage,
  userData,
  preselectedDeviceId
}) => {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(
    format(new Date(), 'HH:mm')
  );
  const [currentDate, setCurrentDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  
  // Reset selected devices when modal opens
  useEffect(() => {
    if (isOpen && userData) {
      if (preselectedDeviceId) {
        // If a specific device is preselected, only select that one
        setSelectedDevices([preselectedDeviceId]);
      } else {
        // Otherwise select all devices by default
        setSelectedDevices(userData.devices.map(device => device.deviceId));
      }
      
      // Reset time and date to current
      setCurrentTime(format(new Date(), 'HH:mm'));
      setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [isOpen, userData, preselectedDeviceId]);
  
  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(e.target.value);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(e.target.value);
  };
  
  const handleSubmit = () => {
    const timestamp = `${currentDate}T${currentTime}:00`;
    onAddUsage(selectedDevices, timestamp);
    onClose();
  };
  
  const getDeviceTypeName = (code: string): string => {
    const names: Record<string, string> = {
      'glucose-regulator': 'Glucose Regulator',
      'pulse-regulator': 'Pulse Regulator',
      'pressure-regulator': 'Pressure Regulator'
    };
    return names[code] || code;
  };
  
  if (!userData) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Device Usage</DialogTitle>
          <DialogDescription>
            Record which devices you've used to keep your health tracking accurate.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="usage-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Usage
              </Label>
              <input
                id="usage-date"
                type="date"
                value={currentDate}
                onChange={handleDateChange}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="usage-time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time of Usage
              </Label>
              <input
                id="usage-time"
                type="time"
                value={currentTime}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Devices Used:</Label>
            {userData.devices.map((device: UserDevice) => (
              <div key={device.deviceId} className="flex items-center space-x-2">
                <Checkbox
                  id={device.deviceId}
                  checked={selectedDevices.includes(device.deviceId)}
                  onCheckedChange={() => handleDeviceToggle(device.deviceId)}
                  disabled={preselectedDeviceId === device.deviceId}
                />
                <Label
                  htmlFor={device.deviceId}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getDeviceTypeName(device.deviceType)} ({device.deviceId})
                </Label>
              </div>
            ))}
            
            {userData.devices.length === 0 && (
              <p className="text-sm text-gray-500">
                You don't have any devices allocated to you yet.
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2"
            disabled={selectedDevices.length === 0}
          >
            <Check className="w-4 h-4" />
            Add Usage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUsageModal; 