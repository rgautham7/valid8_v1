import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Smartphone, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Provider, DeviceType, User, Device } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DeviceAllocationToProviderModal from './DeviceAllocationToProviderModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';

interface ProviderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
}

const ProviderViewModal: React.FC<ProviderViewModalProps> = ({
  isOpen,
  onClose,
  providerId
}) => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allocatedDevices, setAllocatedDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isDeallocateDialogOpen, setIsDeallocateDialogOpen] = useState(false);
  const [deviceToRemove, setDeviceToRemove] = useState<string | null>(null);

  // Load provider, device types, and users from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        setError(null);

        // Load providers
        const storedProviders = localStorage.getItem('providers');
        if (storedProviders) {
          const parsedProviders = JSON.parse(storedProviders);
          const foundProvider = parsedProviders.find((p: Provider) => p.id === providerId);
          
          if (foundProvider) {
            setProvider(foundProvider);
            
            // Load allocated devices for this provider
            const devicesData = localStorage.getItem('devices');
            if (devicesData) {
              const allDevices: Device[] = JSON.parse(devicesData);
              const providerDevices = foundProvider.allocatedDevices 
                ? allDevices.filter(d => foundProvider.allocatedDevices?.includes(d.id))
                : [];
              setAllocatedDevices(providerDevices);
            }
          } else {
            setError('Provider not found');
          }
        } else {
          setError('No providers found');
        }

        // Load device types
        const storedDeviceTypes = localStorage.getItem('deviceTypes');
        if (storedDeviceTypes) {
          setDeviceTypes(JSON.parse(storedDeviceTypes));
        }

        // Load users
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
          const parsedUsers = JSON.parse(storedUsers);
          const providerUsers = parsedUsers.filter((user: User) => user.providerId === providerId);
          setUsers(providerUsers);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && providerId) {
      loadData();
    }
  }, [isOpen, providerId]);

  // Get device type name by code
  const getDeviceTypeName = (code: string) => {
    const deviceType = deviceTypes.find(dt => dt.code === code);
    return deviceType ? deviceType.name : code;
  };

  // Get device type name by id
  const getDeviceTypeById = (id: string) => {
    const deviceType = deviceTypes.find(dt => dt.id === id);
    return deviceType ? deviceType.name : id;
  };

  // Get device type code by id
  const getDeviceTypeCodeById = (id: string) => {
    const deviceType = deviceTypes.find(dt => dt.id === id);
    return deviceType ? deviceType.code : '';
  };

  // Navigate to provider users page
  const handleViewAllUsers = () => {
    onClose();
    navigate(`/admin/provider-users/${providerId}`);
  };

  // Handle device allocation modal
  const handleOpenAllocationModal = () => {
    setIsAllocationModalOpen(true);
  };

  // Handle allocation complete
  const handleAllocationComplete = (updatedProvider: Provider) => {
    setProvider(updatedProvider);
    
    // Refresh allocated devices
    const devicesData = localStorage.getItem('devices');
    if (devicesData) {
      const allDevices: Device[] = JSON.parse(devicesData);
      const providerDevices = updatedProvider.allocatedDevices 
        ? allDevices.filter(d => updatedProvider.allocatedDevices?.includes(d.id))
        : [];
      setAllocatedDevices(providerDevices);
    }
  };

  // Open deallocate confirmation
  const openDeallocateConfirm = (deviceId: string) => {
    setDeviceToRemove(deviceId);
    setIsDeallocateDialogOpen(true);
  };

  // Handle device deallocation
  const handleDeallocateDevice = () => {
    if (!deviceToRemove || !provider) return;

    try {
      // Get all providers from localStorage
      const providersData = localStorage.getItem('providers');
      if (!providersData) {
        toast.error('Provider data not available');
        return;
      }
      const providers: Provider[] = JSON.parse(providersData);

      // Get all devices from localStorage
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) {
        toast.error('Devices data not available');
        return;
      }
      const allDevices: Device[] = JSON.parse(devicesData);

      // Check if the device is allocated to a user
      const device = allDevices.find(d => d.id === deviceToRemove);
      if (device && device.allocation === 'allocated') {
        // Get user information to provide more details
        const usersData = localStorage.getItem('users');
        let userName = 'a user';
        
        if (usersData) {
          const users: User[] = JSON.parse(usersData);
          const user = users.find(u => u.id === device.allocatedTo);
          if (user) {
            userName = user.name;
          }
        }
        
        toast.error(`Cannot deallocate device. It is currently assigned to ${userName}. The provider must deallocate the device from the user first.`);
        setIsDeallocateDialogOpen(false);
        setDeviceToRemove(null);
        return;
      }

      // Update provider's allocated devices
      const updatedProviders = providers.map(p => {
        if (p.id === providerId) {
          return {
            ...p,
            allocatedDevices: p.allocatedDevices?.filter(id => id !== deviceToRemove) || []
          };
        }
        return p;
      });

      // Update device's provider allocation
      const updatedDevices = allDevices.map(device => {
        if (device.id === deviceToRemove) {
          return {
            ...device,
            providerAllocation: undefined
          };
        }
        return device;
      });

      // Save updates to localStorage
      localStorage.setItem('providers', JSON.stringify(updatedProviders));
      localStorage.setItem('devices', JSON.stringify(updatedDevices));

      // Update local state
      const updatedProvider = updatedProviders.find(p => p.id === providerId);
      if (updatedProvider) {
        setProvider(updatedProvider);
      }
      setAllocatedDevices(prev => prev.filter(d => d.id !== deviceToRemove));

      toast.success('Device deallocated successfully');
    } catch (error) {
      console.error('Error deallocating device:', error);
      toast.error('Failed to deallocate device');
    } finally {
      setIsDeallocateDialogOpen(false);
      setDeviceToRemove(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
            <DialogDescription>
              Detailed information about the provider.
            </DialogDescription>
            <Button 
              className="absolute right-2 top-2" 
              variant="ghost" 
              size="icon"
              onClick={onClose}
            >
            </Button>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">{error}</div>
          ) : provider ? (
            <div className="space-y-6">
              {/* Provider Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Provider Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">ID</p>
                      <p>{provider.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Name</p>
                      <p>{provider.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Mobile No</p>
                      <p>{provider.mobileNo}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">License Number</p>
                      <p>{provider.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Specialization</p>
                      <p>{provider.specialistIn}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Users Count</p>
                      <p>{provider.usersCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Device Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Device Types</CardTitle>
                  <CardDescription>
                    Device types associated with this provider
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {provider.deviceTypes.length === 0 ? (
                    <p className="text-muted-foreground">No device types associated</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {provider.deviceTypes.map(code => (
                        <Badge key={code} variant="outline">
                          {getDeviceTypeName(code)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Allocated Devices */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Allocated Devices</CardTitle>
                    <CardDescription>
                      Devices allocated to this provider
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleOpenAllocationModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Allocate Devices
                  </Button>
                </CardHeader>
                <CardContent>
                  {allocatedDevices.length === 0 ? (
                    <p className="text-muted-foreground">No devices allocated to this provider</p>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Device ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Validity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Allocation</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allocatedDevices.map((device) => {
                            const deviceTypeCode = getDeviceTypeCodeById(device.deviceTypeId);
                            return (
                              <TableRow key={device.id}>
                                <TableCell>{device.id}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Smartphone className="w-4 h-4 mr-2 text-blue-500" />
                                    {getDeviceTypeById(device.deviceTypeId)}
                                  </div>
                                </TableCell>
                                <TableCell>{device.yearOfManufacturing}</TableCell>
                                <TableCell>{device.validity}</TableCell>
                                <TableCell>
                                  <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                                    {device.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {device.allocation === 'allocated' ? (
                                    <Badge variant="destructive">
                                      Allocated to user
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">
                                      Not allocated
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openDeallocateConfirm(device.id)}
                                    disabled={device.allocation === 'allocated'}
                                    title={device.allocation === 'allocated' ? "Cannot deallocate device assigned to a user" : "Deallocate device"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Users</CardTitle>
                    <CardDescription>
                      Users associated with this provider
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleViewAllUsers}>
                    <Users className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <p className="text-muted-foreground">No users associated</p>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.slice(0, 5).map(user => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.age}</TableCell>
                              <TableCell>{user.gender}</TableCell>
                              <TableCell>
                                <Badge variant={user.activity === 'Active' ? 'default' : 'secondary'}>
                                  {user.activity}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {users.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center">
                                <Button 
                                  variant="link" 
                                  onClick={handleViewAllUsers}
                                >
                                  View all {users.length} users
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">Provider not found</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Device Allocation Modal */}
      {isAllocationModalOpen && (
        <DeviceAllocationToProviderModal
          isOpen={isAllocationModalOpen}
          onClose={() => setIsAllocationModalOpen(false)}
          providerId={providerId}
          onAllocationComplete={handleAllocationComplete}
        />
      )}

      {/* Device Deallocation Confirmation Dialog */}
      <AlertDialog open={isDeallocateDialogOpen} onOpenChange={setIsDeallocateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Device Deallocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deallocate device <strong>{deviceToRemove}</strong> from this provider?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeviceToRemove(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeallocateDevice}>
              Deallocate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProviderViewModal;