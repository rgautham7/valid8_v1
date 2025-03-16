import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DeviceType } from '../types/index';
import { deviceTypes as initialDeviceTypes } from '../data/mockData';

interface DeviceTypeContextType {
    deviceTypes: DeviceType[];
    addDeviceType: (deviceType: DeviceType) => void;
    updateDeviceType: (id: string, deviceType: Partial<DeviceType>) => void;
    deleteDeviceType: (id: string) => void;
    getDeviceTypeById: (id: string) => DeviceType | undefined;
    loading: boolean;
    error: string | null;
}

const DeviceTypeContext = createContext<DeviceTypeContextType>({
    deviceTypes: [],
    addDeviceType: () => {},
    updateDeviceType: () => {},
    deleteDeviceType: () => {},
    getDeviceTypeById: () => undefined,
    loading: false,
    error: null,
});

export const useDeviceTypes = () => useContext(DeviceTypeContext);

interface DeviceTypeProviderProps {
    children: ReactNode;
}

export const DeviceTypeProvider = ({ children }: DeviceTypeProviderProps) => {
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDeviceTypes = async () => {
            try {
                const storedDeviceTypes = localStorage.getItem('deviceTypes');
                if (storedDeviceTypes) {
                    setDeviceTypes(JSON.parse(storedDeviceTypes));
                } else {
                    setDeviceTypes(initialDeviceTypes);
                    localStorage.setItem('deviceTypes', JSON.stringify(initialDeviceTypes));
                }
            } catch (err) {
                setError('Failed to fetch device types');
            } finally {
                setLoading(false);
            }
        };
        fetchDeviceTypes();
    }, []);

    useEffect(() => {
        if(deviceTypes.length > 0) {
            localStorage.setItem('deviceTypes', JSON.stringify(deviceTypes));
        }
    }, [deviceTypes]);

    const addDeviceType = (deviceType: DeviceType) => {
        try{
            setDeviceTypes([...deviceTypes, deviceType]);
        } catch (err) {
            setError('Failed to add device type');
        }
    };

    const updateDeviceType = (id: string, updatedDeviceType: Partial<DeviceType>) => {
        try{
            setDeviceTypes(prev => 
                prev.map(deviceType =>
                    deviceType.id === id
                    ? {...deviceType, ...updatedDeviceType}
                    : deviceType
                )
            );
        } catch (err) {
            setError('Failed to update device type');
        }
    };

    const deleteDeviceType = (id: string) => {
        try {
            setDeviceTypes(prev => prev.filter(deviceType => deviceType.id !== id));
        } catch (err) {
            setError('Failed to delete device type');
        }
    };

    const getDeviceTypeById = (id: string) => {
        return deviceTypes.find(deviceType => deviceType.id === id);
    };

    const value = {
        deviceTypes,
        addDeviceType,
        updateDeviceType,
        deleteDeviceType,
        getDeviceTypeById,
        loading,
        error,
    };

    return (
        <DeviceTypeContext.Provider value={value}>
            {children}
        </DeviceTypeContext.Provider>
    );
};
