import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DeviceTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export default function DeviceTypeSelect({ value, onChange }: DeviceTypeSelectProps) {
  const navigate = useNavigate();
  const deviceTypes = [
    'Pressure Regulator',
    'Glucose Regulator',
    'Pulse Regulator'
  ];

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (newValue) {
      navigate(`/admin/${newValue.toLowerCase().replace(' ', '-')}`);
    }
  };

  return (
    <div className="relative mx-auto mt-4 mb-4 bg-white border border-gray-300 rounded-md shadow-md">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="block w-full py-2 pl-3 pr-10 text-base bg-gray-100 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">Select a device type</option>
        {deviceTypes.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}