import React from 'react';
import DeviceTypeDetails from './DeviceTypeDetails';

// Types
import { DeviceType, Device, User } from '../../types';

interface DeviceTypeGridProps {
  deviceTypeCodes: string[];
  deviceTypes: DeviceType[];
  devices: Device[];
  users: User[];
  onViewDevices: (deviceTypeCode: string) => void;
  providerId: string;
}

const DeviceTypeGrid: React.FC<DeviceTypeGridProps> = ({
  deviceTypeCodes,
  deviceTypes,
  devices,
  users,
  onViewDevices,
  providerId
}) => {
  if (!deviceTypeCodes.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">No device types available</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {deviceTypeCodes.map(code => (
        <DeviceTypeDetails
          key={code}
          deviceTypeCode={code}
          deviceTypes={deviceTypes}
          devices={devices}
          users={users}
          onViewDevices={onViewDevices}
          providerId={providerId}
        />
      ))}
    </div>
  );
};

export default DeviceTypeGrid; 