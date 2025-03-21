import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Provider, DeviceType, User } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Navigate to provider users page
  const handleViewAllUsers = () => {
    onClose();
    navigate(`/admin/provider-users/${providerId}`);
  };

  return (
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
            {/* <X className="w-8 h-8" /> */}
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
  );
};

export default ProviderViewModal;
