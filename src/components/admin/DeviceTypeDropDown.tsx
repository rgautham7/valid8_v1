import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { DeviceType } from '../../types';
import { useDeviceTypes } from '../../context/DeviceTypeContext';

interface DeviceTypeDropdownProps {
  onSelect: (deviceType: DeviceType) => void;
  selectedId?: string;
  className?: string;
}

const DeviceTypeDropdown: React.FC<DeviceTypeDropdownProps> = ({
  onSelect,
  selectedId,
  className
}) => {
  const { deviceTypes = [] } = useDeviceTypes();
  const [open, setOpen] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);

  // Set initial selected device type if selectedId is provided
  useEffect(() => {
    if (selectedId) {
      const deviceType = deviceTypes.find(dt => dt.id === selectedId);
      if (deviceType) {
        setSelectedDeviceType(deviceType);
      }
    }
  }, [selectedId, deviceTypes]);

  const handleSelect = (deviceType: DeviceType) => {
    setSelectedDeviceType(deviceType);
    onSelect(deviceType);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedDeviceType ? selectedDeviceType.name : "Select device type..."}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[624px] p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {/* <div className="p-2">
            <input 
              className="w-full p-2 border rounded-md" 
              placeholder="Search device type..." 
            />
          </div> */}
          <div className="py-1">
            {deviceTypes && deviceTypes.length > 0 ? (
              deviceTypes.map((deviceType) => (
                <div
                  key={deviceType.id}
                  className={cn(
                    "flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-300",
                    selectedDeviceType?.id === deviceType.id ? "bg-gray-300" : ""
                  )}
                  onClick={() => handleSelect(deviceType)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedDeviceType?.id === deviceType.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {deviceType.name}
                </div>
              ))
            ) : (
              <div className="px-2 py-1.5 text-gray-500">No device types available</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DeviceTypeDropdown;
