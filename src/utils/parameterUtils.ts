import { DeviceType } from '../types';

/**
 * Get all unique parameters from device types in localStorage
 */
export const getAllUniqueParameters = (): string[] => {
  try {
    const deviceTypesData = localStorage.getItem('deviceTypes');
    if (!deviceTypesData) return [];
    
    const deviceTypes = JSON.parse(deviceTypesData) as DeviceType[];
    const uniqueParams = new Set<string>();
    
    deviceTypes.forEach(deviceType => {
      if (deviceType.parameters) {
        if (Array.isArray(deviceType.parameters)) {
          deviceType.parameters.forEach(param => uniqueParams.add(param.trim()));
        } else {
          // Handle legacy string format
          deviceType.parameters.split(',')
            .map(p => p.trim())
            .filter(p => p)
            .forEach(p => uniqueParams.add(p));
        }
      }
    });
    
    return Array.from(uniqueParams).sort();
  } catch (error) {
    console.error('Error getting parameters:', error);
    return [];
  }
};

/**
 * Format parameters for display (handles both string and array)
 */
export const formatParameters = (parameters?: string | string[]): string => {
  if (!parameters) return 'None';
  
  if (Array.isArray(parameters)) {
    return parameters.join(', ');
  }
  
  return parameters;
};

/**
 * Search parameters based on a search term
 */
export const searchParameters = (
  allParameters: string[], 
  searchTerm: string,
  excludeParameters: string[] = []
): string[] => {
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) {
    return allParameters.filter(param => !excludeParameters.includes(param));
  }
  
  return allParameters.filter(
    param => param.toLowerCase().includes(term) && !excludeParameters.includes(param)
  );
};

/**
 * Normalize parameters (convert string to array if needed)
 */
export const normalizeParameters = (parameters?: string | string[]): string[] => {
  if (!parameters) return [];
  
  if (Array.isArray(parameters)) {
    return parameters;
  }
  
  return parameters
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
}; 