import React from 'react';
import { X } from 'lucide-react';
import { DeviceType } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface DeviceTypeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceType: DeviceType;
}

const DeviceTypeViewModal: React.FC<DeviceTypeViewModalProps> = ({
  isOpen,
  onClose,
  deviceType
}) => {
  if (!isOpen) return null;

  // Handle parameters display (supporting both string and array)
  const renderParameters = () => {
    if (!deviceType.parameters) return <div>No parameters</div>;
    
    // If parameters is a string, split it into an array
    const params = Array.isArray(deviceType.parameters) 
      ? deviceType.parameters 
      : deviceType.parameters.split(',').map((p: string) => p.trim());
    
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {params.map((param: string, index: number) => (
          <Badge key={index} variant="secondary">
            {param}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-3xl p-6 bg-white rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Device Type Details</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information - Right Grid Top */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h4 className="mb-2 text-sm font-medium text-gray-500">Basic Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500">Device Type</label>
                <div className="font-medium">{deviceType.name}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Code</label>
                <div className="font-medium">{deviceType.code}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Parameters</label>
                {renderParameters()}
              </div>
            </div>
          </div>
          
          {/* Manufacturing Details */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h4 className="mb-2 text-sm font-medium text-gray-500">Manufacturing Details</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500">Manufacturer</label>
                <div className="font-medium">{deviceType.manufacturer || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Country of Origin</label>
                <div className="font-medium">{deviceType.countryOfOrigin || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Year of Manufacturing</label>
                <div className="font-medium">{deviceType.yearOfManufacturing || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Validity</label>
                <div className="font-medium">{deviceType.validity || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h4 className="mb-2 text-sm font-medium text-gray-500">Additional Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500">Remarks</label>
                <div className="font-medium whitespace-pre-wrap">{deviceType.remarks || 'N/A'}</div>
              </div>
              {deviceType.manualUrl && (
                <div>
                  <label className="block text-xs text-gray-500">Manual</label>
                  <a 
                    href={deviceType.manualUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Manual
                  </a>
                </div>
              )}
              {deviceType.videoUrl && (
                <div>
                  <label className="block text-xs text-gray-500">Instructional Video</label>
                  <a 
                    href={deviceType.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Video
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default DeviceTypeViewModal;
