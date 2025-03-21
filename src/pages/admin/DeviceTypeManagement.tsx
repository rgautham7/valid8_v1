import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Eye, Upload, PlusCircle, Database, Search, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { DeviceType } from '../../types';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useToast } from '../../hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import Breadcrumb from '../../components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import DeviceTypeAddModal, { DeviceTypeFormData } from './DeviceTypeAddModal';
import { Badge } from '../../components/ui/badge';

const DeviceTypeManagement = () => {
  const navigate = useNavigate();
  const { toast: showToast } = useToast();
  
  // State
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<DeviceType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deviceToView, setDeviceToView] = useState<DeviceType | null>(null);
  const [filteredDeviceTypes, setFilteredDeviceTypes] = useState<DeviceType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<DeviceTypeFormData>({
    name: '',
    deviceType: '',
    deviceParameters: [],
    manufacturer: '',
    countryOfOrigin: '',
    yearOfManufacturing: '',
    validity: '',
    remarks: '',
    manual: null,
    video: null,
    image: null
  });

  const breadcrumbItems = [
    { title: 'Dashboard', path: '/admin' },
    { title: 'Device Type Management', path: '/admin/device-type-management' }
  ];

  // Load device types from localStorage
  useEffect(() => {
    const loadDeviceTypes = () => {
      setLoading(true);
      setError(null);
      
      try {
        const deviceTypesData = localStorage.getItem('deviceTypes');
        
        if (deviceTypesData) {
          const parsedDeviceTypes: DeviceType[] = JSON.parse(deviceTypesData);
          console.log('Loaded device types:', parsedDeviceTypes);
          setDeviceTypes(parsedDeviceTypes);
          setFilteredDeviceTypes(parsedDeviceTypes);
        } else {
          console.log('No device types found in localStorage');
          setDeviceTypes([]);
          setFilteredDeviceTypes([]);
          
          // Initialize with mock data if not found
          const { deviceTypes: mockDeviceTypes } = require('../../data/mockData');
          localStorage.setItem('deviceTypes', JSON.stringify(mockDeviceTypes));
          setDeviceTypes(mockDeviceTypes);
          setFilteredDeviceTypes(mockDeviceTypes);
        }
      } catch (err) {
        console.error('Error loading device types:', err);
        setError('Failed to load device types. Please try again.');
        showToast({
          title: 'Error',
          description: 'Failed to load device types',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDeviceTypes();
  }, [showToast]);
  
  // Filter device types based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDeviceTypes(deviceTypes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = deviceTypes.filter(
        deviceType => 
          deviceType.name.toLowerCase().includes(query) ||
          deviceType.code.toLowerCase().includes(query) ||
          (deviceType.manufacturer && deviceType.manufacturer.toLowerCase().includes(query))
      );
      setFilteredDeviceTypes(filtered);
    }
  }, [searchQuery, deviceTypes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      deviceType: '',
      deviceParameters: [],
      manufacturer: '',
      countryOfOrigin: '',
      yearOfManufacturing: '',
      validity: '',
      remarks: '',
      manual: null,
      video: null,
      image: null
    });
  };

  const handleAddDeviceType = (formData: DeviceTypeFormData) => {
    try {
      // Check for duplicate names
      const isDuplicate = deviceTypes.some(dt => 
        dt.name.toLowerCase() === formData.name.toLowerCase()
      );
      
      if (isDuplicate) {
        showToast({
          title: 'Error',
          description: 'A device type with this name already exists',
          variant: 'destructive',
        });
        return;
      }
      
      // Create new device type
      const newDeviceType: DeviceType = {
        id: `DT${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        name: formData.name,
        code: formData.deviceType,
        manufacturer: formData.manufacturer,
        countryOfOrigin: formData.countryOfOrigin,
        yearOfManufacturing: formData.yearOfManufacturing,
        validity: formData.validity,
        parameters: formData.deviceParameters,
        remarks: formData.remarks,
        manualUrl: formData.manual ? URL.createObjectURL(formData.manual) : '',
        videoUrl: formData.video ? URL.createObjectURL(formData.video) : ''
      };
      
      const updatedDeviceTypes = [...deviceTypes, newDeviceType];
      setDeviceTypes(updatedDeviceTypes);
      localStorage.setItem('deviceTypes', JSON.stringify(updatedDeviceTypes));
      
      showToast({
        title: 'Success',
        description: 'Device type added successfully',
      });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding device type:', error);
      showToast({
        title: 'Error',
        description: 'Failed to add device type',
        variant: 'destructive',
      });
    }
  };

  const handleEditDeviceType = (deviceType: DeviceType) => {
    setSelectedDeviceType(deviceType);
    setFormData({
      name: deviceType.name,
      deviceType: deviceType.code,
      deviceParameters: deviceType.parameters || [],
      manufacturer: deviceType.manufacturer || '',
      countryOfOrigin: deviceType.countryOfOrigin || '',
      yearOfManufacturing: deviceType.yearOfManufacturing || '',
      validity: deviceType.validity || '',
      remarks: deviceType.remarks || '',
      manual: null,
      video: null,
      image: null
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleUpdateDeviceType = (formData: DeviceTypeFormData) => {
    try {
      if (!selectedDeviceType) return;
      
      // Check for duplicate names (excluding current device type)
      const isDuplicate = deviceTypes.some(dt => 
        dt.id !== selectedDeviceType.id && 
        dt.name.toLowerCase() === formData.name.toLowerCase()
      );
      
      if (isDuplicate) {
        showToast({
          title: 'Error',
          description: 'A device type with this name already exists',
          variant: 'destructive',
        });
        return;
      }
      
      const updatedDeviceTypes = deviceTypes.map(dt => 
        dt.id === selectedDeviceType.id
          ? {
              ...dt,
              name: formData.name,
              code: formData.deviceType,
              manufacturer: formData.manufacturer,
              countryOfOrigin: formData.countryOfOrigin,
              yearOfManufacturing: formData.yearOfManufacturing,
              validity: formData.validity,
              parameters: formData.deviceParameters,
              remarks: formData.remarks,
              manualUrl: formData.manual ? URL.createObjectURL(formData.manual) : dt.manualUrl,
              videoUrl: formData.video ? URL.createObjectURL(formData.video) : dt.videoUrl
            }
          : dt
      );
      
      setDeviceTypes(updatedDeviceTypes);
      localStorage.setItem('deviceTypes', JSON.stringify(updatedDeviceTypes));
      
      showToast({
        title: 'Success',
        description: 'Device type updated successfully',
      });
      
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedDeviceType(null);
    } catch (error) {
      console.error('Error updating device type:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update device type',
        variant: 'destructive',
      });
    }
  };

  const openDeleteConfirm = (deviceType: DeviceType) => {
    setDeviceToDelete(deviceType);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteDeviceType = () => {
    try {
      if (!deviceToDelete) return;
      
      // Delete device type
      const updatedDeviceTypes = deviceTypes.filter(dt => dt.id !== deviceToDelete.id);
      
      // Update state and localStorage
      setDeviceTypes(updatedDeviceTypes);
      localStorage.setItem('deviceTypes', JSON.stringify(updatedDeviceTypes));
      
      // Show success message
      showToast({
        title: 'Success',
        description: 'Device type deleted successfully',
      });
      
      // Close dialog
      setIsDeleteConfirmOpen(false);
      setDeviceToDelete(null);
    } catch (error) {
      console.error('Error deleting device type:', error);
      showToast({
        title: 'Error',
        description: 'Failed to delete device type',
        variant: 'destructive',
      });
    }
  };

  const handleViewDeviceType = (deviceType: DeviceType) => {
    setDeviceToView(deviceType);
    setIsViewModalOpen(true);
  };

  const handleManageDevices = (deviceType: DeviceType) => {
    navigate(`/admin/device-management/${deviceType.id}`);
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="container p-6 mx-auto">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-2"
              onClick={handleBackToAdmin}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <CardTitle className="text-2xl">Device Type Management</CardTitle>
            <CardDescription>
              Manage device types in the system
            </CardDescription>
          </div>
          <Button onClick={() => {
            setIsEditMode(false);
            resetForm();
            setIsModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" /> Add Device Type
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search device types..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex items-start p-4 mb-4 rounded-md bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          ) : filteredDeviceTypes.length === 0 ? (
            <div className="py-10 text-center">
              <Database className="w-10 h-10 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">No device types found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new device type.
              </p>
              <div className="mt-6">
                <Button onClick={() => {
                  setIsEditMode(false);
                  resetForm();
                  setIsModalOpen(true);
                }}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Device Type
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left uppercase">Code</TableHead>
                    <TableHead className="text-left uppercase">Name</TableHead>
                    <TableHead className="text-left uppercase">Manufacturer</TableHead>
                    <TableHead className="text-left uppercase">Validity</TableHead>
                    <TableHead className="text-center uppercase">Parameters</TableHead>
                    <TableHead className="text-center uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeviceTypes.map((deviceType) => (
                    <TableRow key={deviceType.id}>
                      <TableCell className="font-medium">{deviceType.code}</TableCell>
                      <TableCell>{deviceType.name}</TableCell>
                      <TableCell>{deviceType.manufacturer || 'N/A'}</TableCell>
                      <TableCell>{deviceType.validity || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {deviceType.parameters ? (
                            Array.isArray(deviceType.parameters) ? (
                              deviceType.parameters.map((param, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {param}
                                </Badge>
                              ))
                            ) : (
                              // Handle legacy string format
                              deviceType.parameters.split(',').map((param: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {param.trim()}
                                </Badge>
                              ))
                            )
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDeviceType(deviceType)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDeviceType(deviceType)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteConfirm(deviceType)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageDevices(deviceType)}
                          >
                            Manage Devices
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <DeviceTypeAddModal 
        isOpen={isModalOpen}
        onClose={() => {
              setIsModalOpen(false);
              setIsEditMode(false);
              setSelectedDeviceType(null);
        }}
        onSubmit={(formData: DeviceTypeFormData) => {
          if (isEditMode) {
            handleUpdateDeviceType(formData);
          } else {
            handleAddDeviceType(formData);
          }
        }}
        initialData={selectedDeviceType ? {
          deviceType: selectedDeviceType.name,
          deviceParameters: selectedDeviceType.parameters || [],
          manufacturer: selectedDeviceType.manufacturer || '',
          countryOfOrigin: selectedDeviceType.countryOfOrigin || '',
          yearOfManufacturing: selectedDeviceType.yearOfManufacturing || '',
          validity: selectedDeviceType.validity || '',
          remarks: selectedDeviceType.remarks || '',
          image: null,
          video: null,
          manual: null
        } : undefined}
        isEditMode={isEditMode}
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Device Type Details</DialogTitle>
          </DialogHeader>
          {deviceToView && (
            <div className="py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-right">ID:</div>
                <div className="col-span-2">{deviceToView.id}</div>
                
                <div className="font-medium text-right">Name:</div>
                <div className="col-span-2">{deviceToView.name}</div>
                
                <div className="font-medium text-right">Code:</div>
                <div className="col-span-2">{deviceToView.code}</div>
                
                <div className="font-medium text-right">Manufacturer:</div>
                <div className="col-span-2">{deviceToView.manufacturer || 'N/A'}</div>
                
                <div className="font-medium text-right">Country of Origin:</div>
                <div className="col-span-2">{deviceToView.countryOfOrigin || 'N/A'}</div>
                
                <div className="font-medium text-right">Year of Manufacturing:</div>
                <div className="col-span-2">{deviceToView.yearOfManufacturing || 'N/A'}</div>
                
                <div className="font-medium text-right">Validity:</div>
                <div className="col-span-2">{deviceToView.validity || 'N/A'}</div>
                
                <div className="font-medium text-right">Parameters:</div>
                <div className="col-span-2">{deviceToView.parameters || 'N/A'}</div>
                
                <div className="font-medium text-right">Remarks:</div>
                <div className="col-span-2">{deviceToView.remarks || 'N/A'}</div>
                
                <div className="font-medium text-right">Manual URL:</div>
                <div className="col-span-2">
                  {deviceToView.manualUrl ? (
                    <a 
                      href={deviceToView.manualUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Manual
                    </a>
                  ) : 'N/A'}
                </div>
                
                <div className="font-medium text-right">Video URL:</div>
                <div className="col-span-2">
                  {deviceToView.videoUrl ? (
                    <a 
                      href={deviceToView.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Video
                    </a>
                  ) : 'N/A'}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            {deviceToView && (
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleManageDevices(deviceToView);
              }}>
                Manage Devices
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the device type
              {deviceToDelete && ` "${deviceToDelete.name}"`} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeviceType}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeviceTypeManagement;