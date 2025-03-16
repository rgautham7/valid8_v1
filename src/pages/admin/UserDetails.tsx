import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Loader2, AlertCircle, 
  User, Calendar, Activity, Smartphone
} from 'lucide-react';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import Breadcrumb from '../../components/ui/breadcrumb';

// Utils
import { getFromStorage, saveToStorage } from '../../utils/storageUtils';

// Types
import { User as UserType, Device, Provider, DeviceType } from '../../types';

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  // State
  const [user, setUser] = useState<UserType | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Breadcrumbs
  const breadcrumbItems = [
    { title: 'Dashboard', path: '/admin' },
    { title: 'User Details', path: `/admin/user-details/${userId}` }
  ];
  
  // Load user data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load user
        const users = getFromStorage<UserType[]>('users', []);
        const foundUser = users.find(u => u.id === userId);
        
        if (!foundUser) {
          toast.error('User not found');
          navigate('/admin');
          return;
        }
        
        setUser(foundUser);
        
        // Load provider if user has one
        if (foundUser.providerId) {
          const providers = getFromStorage<Provider[]>('providers', []);
          const foundProvider = providers.find(p => p.id === foundUser.providerId);
          setProvider(foundProvider || null);
          
          // Update breadcrumbs if from provider
          if (foundProvider) {
            breadcrumbItems.splice(1, 0, { 
              title: 'Provider Management', 
              path: '/admin/provider-management' 
            });
            breadcrumbItems.splice(2, 0, { 
              title: foundProvider.name, 
              path: `/admin/provider-users/${foundProvider.id}` 
            });
          }
        }
        
        // Load device types
        const allDeviceTypes = getFromStorage<DeviceType[]>('deviceTypes', []);
        setDeviceTypes(allDeviceTypes);
        
        // Load devices
        const allDevices = getFromStorage<Device[]>('devices', []);
        setDevices(allDevices);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId, navigate]);
  
  // Get device type name
  const getDeviceTypeName = (code: string) => {
    const deviceType = deviceTypes.find(dt => dt.code === code);
    return deviceType ? deviceType.name : code;
  };
  
  // Get device details
  const getDeviceDetails = (deviceId: string) => {
    return devices.find(d => d.id === deviceId);
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (provider) {
      navigate(`/admin/provider-users/${provider.id}`);
    } else {
      navigate('/admin');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading user details...</span>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container p-6 mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="py-10 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
              <h2 className="mb-2 text-xl font-semibold">User Not Found</h2>
              <p className="mb-4 text-muted-foreground">
                The user you're looking for doesn't exist.
              </p>
              <Button onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
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
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <CardTitle className="text-2xl">
              User Details
            </CardTitle>
            <CardDescription>
              Detailed information for user {user.id}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* User Information */}
          <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <User className="inline-block w-4 h-4 mr-2" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-medium">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{user.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="font-medium">{user.gender}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <Activity className="inline-block w-4 h-4 mr-2" />
                  Status Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge 
                      variant={user.activity === 'Active' ? 'default' : 'secondary'}
                    >
                      {user.activity}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium">
                      {provider ? provider.name : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Devices:</span>
                    <span className="font-medium">{user.devices.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <Calendar className="inline-block w-4 h-4 mr-2" />
                  Registration Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registered:</span>
                    <span className="font-medium">{user.registeredOn || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Active:</span>
                    <span className="font-medium">{user.lastActiveOn || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* User Devices */}
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                <Smartphone className="inline-block w-5 h-5 mr-2" />
                User Devices
              </CardTitle>
              <CardDescription>
                Devices allocated to this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.devices.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">No devices allocated to this user</p>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device ID</TableHead>
                        <TableHead>Device Type</TableHead>
                        <TableHead>Allocated On</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.devices.map((userDevice) => {
                        const deviceDetails = getDeviceDetails(userDevice.deviceId);
                        
                        return (
                          <TableRow key={userDevice.deviceId}>
                            <TableCell className="font-medium">{userDevice.deviceId}</TableCell>
                            <TableCell>{getDeviceTypeName(userDevice.deviceType)}</TableCell>
                            <TableCell>{userDevice.allocatedOn || 'N/A'}</TableCell>
                            <TableCell>{userDevice.lastUsedOn || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {deviceDetails?.status || 'Unknown'}
                              </Badge>
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
        </CardContent>
      </Card>
    </div>
  );
} 