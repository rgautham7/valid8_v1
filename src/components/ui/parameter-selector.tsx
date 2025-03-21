import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';

interface ParameterSelectorProps {
  selectedParameters: string[];
  onChange: (parameters: string[]) => void;
}

const ParameterSelector: React.FC<ParameterSelectorProps> = ({
  selectedParameters,
  onChange
}) => {
  const [allParameters, setAllParameters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParameters, setFilteredParameters] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load all existing parameters from localStorage
  useEffect(() => {
    const loadParameters = () => {
      try {
        const deviceTypesData = localStorage.getItem('deviceTypes');
        if (deviceTypesData) {
          const deviceTypes = JSON.parse(deviceTypesData);
          // Extract unique parameters from all device types
          const parameters = new Set<string>();
          
          deviceTypes.forEach((dt: any) => {
            if (dt.parameters) {
              // Handle both string and array parameters during transition
              const paramArray = Array.isArray(dt.parameters) 
                ? dt.parameters 
                : dt.parameters.split(',').map((p: string) => p.trim());
              
              paramArray.forEach((param: string) => {
                parameters.add(param);
              });
            }
          });
          
          setAllParameters(Array.from(parameters).sort());
        }
      } catch (error) {
        console.error('Error loading parameters:', error);
      }
    };
    
    loadParameters();
  }, []);

  // Filter parameters based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredParameters(allParameters.filter(param => 
        !selectedParameters.includes(param)
      ));
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = allParameters.filter(param => 
      param.toLowerCase().includes(term) && !selectedParameters.includes(param)
    );
    
    setFilteredParameters(filtered);
  }, [searchTerm, allParameters, selectedParameters]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleAddParameter = (parameter: string) => {
    const normalizedParam = parameter.trim();
    if (!normalizedParam) return;
    
    if (!selectedParameters.includes(normalizedParam)) {
      const updatedParameters = [...selectedParameters, normalizedParam];
      onChange(updatedParameters);
      
      // Clear search and close dropdown
      setSearchTerm('');
      setIsDropdownOpen(false);
      
      // Add to all parameters if it's new
      if (!allParameters.includes(normalizedParam)) {
        setAllParameters([...allParameters, normalizedParam].sort());
      }
    }
  };

  const handleRemoveParameter = (parameter: string) => {
    const updatedParameters = selectedParameters.filter(p => p !== parameter);
    onChange(updatedParameters);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      handleAddParameter(searchTerm);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedParameters.map(param => (
          <Badge key={param} variant="secondary" className="px-2 py-1 text-sm">
            {param}
            <button
              type="button"
              onClick={() => handleRemoveParameter(param)}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <div className="flex">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search parameters or add new ones"
              className="pl-8 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleInputKeyDown}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => handleAddParameter(searchTerm)}
            disabled={!searchTerm.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60"
          >
            {filteredParameters.length > 0 ? (
              <ul className="py-1">
                {filteredParameters.map(param => (
                  <li
                    key={param}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => handleAddParameter(param)}
                  >
                    {param}
                  </li>
                ))}
              </ul>
            ) : searchTerm.trim() ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No parameters found. Press Enter or click Add to create "{searchTerm}".
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No parameters available.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParameterSelector; 