import { getFromStorage, saveToStorage } from './storageUtils';
import { allocateDeviceToUser, deallocateDevice } from './deviceUtils';
import { DeviceType, Device, Provider, User } from '../types';

/**
 * Run comprehensive tests to verify functionality
 */
export const runTests = (): { success: boolean; results: string[] } => {
  const results: string[] = [];
  let success = true;
  
  try {
    // Test 1: Verify data exists
    const deviceTypes = getFromStorage<DeviceType[]>('deviceTypes', []);
    const devices = getFromStorage<Device[]>('devices', []);
    const providers = getFromStorage<Provider[]>('providers', []);
    const users = getFromStorage<User[]>('users', []);
    
    results.push(`Data counts: DeviceTypes=${deviceTypes.length}, Devices=${devices.length}, Providers=${providers.length}, Users=${users.length}`);
    
    if (deviceTypes.length === 0 || devices.length === 0 || providers.length === 0 || users.length === 0) {
      results.push('Missing data detected');
      success = false;
    } else {
      results.push('All data exists');
    }
    
    // Test 2: Test device allocation
    if (devices.length > 0 && users.length > 0) {
      // Find an unallocated device
      const unallocatedDevice = devices.find(d => d.allocation === 'not allocated');
      
      if (unallocatedDevice) {
        const user = users[0];
        const initialDeviceCount = user.devices.length;
        
        // Allocate device
        const allocated = allocateDeviceToUser(unallocatedDevice.id, user.id);
        
        if (allocated) {
          results.push(`Device ${unallocatedDevice.id} allocated to user ${user.id}`);
          
          // Verify allocation
          const updatedDevices = getFromStorage<Device[]>('devices', []);
          const updatedDevice = updatedDevices.find(d => d.id === unallocatedDevice.id);
          
          if (updatedDevice?.allocation === 'allocated' && updatedDevice?.allocatedTo === user.id) {
            results.push('Device allocation verified in devices');
          } else {
            results.push('Device allocation not verified in devices');
            success = false;
          }
          
          const updatedUsers = getFromStorage<User[]>('users', []);
          const updatedUser = updatedUsers.find(u => u.id === user.id);
          
          if (updatedUser && updatedUser.devices.length > initialDeviceCount) {
            results.push('Device allocation verified in user devices');
          } else {
            results.push('Device allocation not verified in user devices');
            success = false;
          }
          
          // Deallocate device
          const deallocated = deallocateDevice(unallocatedDevice.id);
          
          if (deallocated) {
            results.push(`Device ${unallocatedDevice.id} deallocated`);
            
            // Verify deallocation
            const finalDevices = getFromStorage<Device[]>('devices', []);
            const finalDevice = finalDevices.find(d => d.id === unallocatedDevice.id);
            
            if (finalDevice?.allocation === 'not allocated' && !finalDevice?.allocatedTo) {
              results.push('Device deallocation verified in devices');
            } else {
              results.push('Device deallocation not verified in devices');
              success = false;
            }
          } else {
            results.push(`Failed to deallocate device ${unallocatedDevice.id}`);
            success = false;
          }
        } else {
          results.push(`Failed to allocate device ${unallocatedDevice.id} to user ${user.id}`);
          success = false;
        }
      } else {
        results.push('No unallocated devices found for testing');
      }
    } else {
      results.push('Not enough data for allocation testing');
    }
    
    return { success, results };
  } catch (error) {
    results.push(`Error during tests: ${error instanceof Error ? error.message : String(error)}`);
    return { success: false, results };
  }
}; 