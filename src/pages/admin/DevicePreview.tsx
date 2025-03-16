import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Device } from '../../types/index';
import { useDevices } from '../../hooks/useDevice';
import { useDeviceTypes } from '../../context/DeviceTypeContext';
import AdminNavbar from '../../components/layout/AdminNavbar';

// Mock data for preview - in a real app, this would come from parsing the uploaded file
const mockPreviewData: Device[] = [
  {
    id: 'BG001',
    deviceTypeId: '1', // This should match an actual device type ID in your system
    yearOfManufacturing: '2023-01-01',
    validity: '2025-01-01',
    status: 'active',
  },
  {
    id: 'BG002',
    deviceTypeId: '1',
    yearOfManufacturing: '2023-02-15',
    validity: '2025-02-15',
    status: 'active',
  },
  {
    id: 'GR001',
    deviceTypeId: '2', // This should match another device type ID
    yearOfManufacturing: '2023-03-10',
    validity: '2025-03-10',
    status: 'active',
  },
];

const DevicePreview: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addDevices } = useDevices();
  const { deviceTypes, getDeviceTypeById } = useDeviceTypes();
  
  const [previewData, setPreviewData] = useState<Device[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // In a real app, you would parse the uploaded file here
    // For now, we'll use the mock data
    setPreviewData(mockPreviewData);
    
    // Validate the data
    validateData(mockPreviewData);
  }, []);

  const validateData = (data: Device[]) => {
    const newErrors: Record<string, string[]> = {};
    
    data.forEach((device, index) => {
      const deviceErrors: string[] = [];
      
      // Check if device type exists
      if (!deviceTypes.some(dt => dt.id === device.deviceTypeId)) {
        deviceErrors.push(`Device type with ID ${device.deviceTypeId} does not exist`);
      }
      
      // Check if device ID is unique
      const isDuplicate = data.some((d, i) => i !== index && d.id === device.id);
      if (isDuplicate) {
        deviceErrors.push(`Duplicate device ID: ${device.id}`);
      }
      
      // Check if validity is in the future
      const validityDate = new Date(device.validity);
      if (validityDate < new Date()) {
        deviceErrors.push('Validity date must be in the future');
      }
      
      if (deviceErrors.length > 0) {
        newErrors[index.toString()] = deviceErrors;
      }
    });
    
    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Validation errors',
        description: 'Please fix the errors before submitting',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addDevices(previewData);
      
      toast({
        title: 'Success',
        description: `${previewData.length} devices have been added successfully.`,
      });
      
      navigate('/admin/device-management');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add devices',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeviceTypeName = (deviceTypeId: string) => {
    const deviceType = getDeviceTypeById(deviceTypeId);
    return deviceType ? deviceType.name : 'Unknown';
  };

  return (
    <>
      <AdminNavbar />
      <div className="container py-6 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Preview Devices</CardTitle>
            <CardDescription>
              Review the devices before adding them to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewData.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-500">No devices to preview</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Device ID</TableHead>
                      <TableHead>Device Type</TableHead>
                      <TableHead>Year of Manufacturing</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((device, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {errors[index.toString()] ? (
                            <X className="w-5 h-5 text-red-500" />
                          ) : (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </TableCell>
                        <TableCell>{device.id}</TableCell>
                        <TableCell>{getDeviceTypeName(device.deviceTypeId)}</TableCell>
                        <TableCell>{device.yearOfManufacturing}</TableCell>
                        <TableCell>{device.validity}</TableCell>
                        <TableCell>{device.status}</TableCell>
                        <TableCell>
                          {errors[index.toString()] && (
                            <ul className="text-sm text-red-500 list-disc list-inside">
                              {errors[index.toString()].map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/bulk-upload')}
            >
              Back
            </Button>
            <Button 
              type="button" 
              disabled={isSubmitting || Object.keys(errors).length > 0} 
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Add Devices'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default DevicePreview;
