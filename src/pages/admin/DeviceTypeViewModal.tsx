import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DeviceType } from '../../types/index';

interface DeviceTypeViewModalProps {
  deviceType: DeviceType;
  onClose: () => void;
}

const DeviceTypeViewModal: React.FC<DeviceTypeViewModalProps> = ({
  deviceType,
  onClose
}) => {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
          <h2 className="text-xl font-bold">Device Type Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Device Image - Left Grid Top */}
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50">
                {deviceType.image ? (
                  <div className="mb-4">
                    <img 
                      src={deviceType.image} 
                      alt={deviceType.name} 
                      className="object-contain rounded-md max-h-48"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-48 mb-4 bg-gray-200 rounded-md">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <h4 className="text-lg font-medium">{deviceType.name}</h4>
                <p className="text-sm text-gray-500">{deviceType.id}</p>
              </div>

              {/* Additional Information - Right Grid Bottom */}
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="mb-2 text-sm font-medium text-gray-500">Additional Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500">Remarks</label>
                    <div className="font-medium">{deviceType.remarks || 'N/A'}</div>
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
                      <label className="block text-xs text-gray-500">Video</label>
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
            
            {/* Right Column */}
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
                    <div className="font-medium">{deviceType.parameters || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              {/* Manufacturing Details - Left Grid Bottom */}
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
                    <div className="font-medium">
                      {formatDate(deviceType.yearOfManufacturing)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Validity</label>
                    <div className="font-medium">
                      {formatDate(deviceType.validity)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 flex justify-end p-4 bg-white border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeviceTypeViewModal;
