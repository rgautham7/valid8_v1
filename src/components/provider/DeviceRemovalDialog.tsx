import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// UI Components
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

// Types
import { User, UserDevice } from '../../types';

interface DeviceRemovalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  device: UserDevice;
  providerId: string;
  onDeviceRemoved: (updatedUser: User) => void;
}

const DeviceRemovalDialog: React.FC<DeviceRemovalDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  device,
  providerId,
  onDeviceRemoved
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle device removal
  const handleRemoveDevice = async () => {
    setIsProcessing(true);
    
    try {
      // 1. Update user's devices
      const usersData = localStorage.getItem('users');
      if (!usersData) {
        throw new Error('User data not available');
      }
      
      const allUsers: User[] = JSON.parse(usersData);
      
      // Remove device from user's devices array
      const updatedUsers = allUsers.map(u => 
        u.id === user.id 
          ? { 
              ...u, 
              devices: u.devices.filter(d => d.deviceId !== device.deviceId) 
            } 
          : u
      );
      
      // 2. Update device allocation status
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) {
        throw new Error('Device data not available');
      }
      
      const allDevices = JSON.parse(devicesData);
      const updatedDevices = allDevices.map(d => 
        d.id === device.deviceId 
          ? { 
              ...d, 
              allocation: 'not allocated', 
              allocatedTo: undefined
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
      onDeviceRemoved(updatedUser);
      
      // Close the dialog
      onOpenChange(false);
      
      toast.success(`Device ${device.deviceId} removed from ${user.name}`);
    } catch (error) {
      console.error('Error removing device:', error);
      toast.error('Failed to remove device');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Device</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove device {device.deviceId} from {user.name}?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemoveDevice}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              'Remove Device'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeviceRemovalDialog; 