import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Search, Loader2, AlertCircle,
  UserX, Eye
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
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import Breadcrumb from '../../components/ui/breadcrumb';

// Utils
import { getFromStorage, saveToStorage } from '../../utils/storageUtils';

// Types
import { Provider, User, DeviceType } from '../../types';

export default function ProviderUsers() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  
  // State for provider and users
  const [provider, setProvider] = useState<Provider | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // State for remove user dialog
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Breadcrumbs
  const breadcrumbItems = [
    { title: 'Dashboard', path: '/admin' },
    { title: 'Provider Management', path: '/admin/provider-management' },
    { title: provider?.name || 'Users', path: `/admin/provider-users/${providerId}` }
  ];
  
  // Load provider and users
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      
      try {
        // Load provider
        const providers = getFromStorage<Provider[]>('providers', []);
        const foundProvider = providers.find(p => p.id === providerId);
        
        if (!foundProvider) {
          toast.error('Provider not found');
          navigate('/admin/provider-management');
          return;
        }
        
        setProvider(foundProvider);
        
        // Load users for this provider
        const allUsers = getFromStorage<User[]>('users', []);
        const providerUsers = allUsers.filter(user => user.providerId === providerId);
        
        setUsers(providerUsers);
        setFilteredUsers(providerUsers);
        
        // Load device types
        const allDeviceTypes = getFromStorage<DeviceType[]>('deviceTypes', []);
        setDeviceTypes(allDeviceTypes);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [providerId, navigate]);
  
  // Filter users based on search term, status, and device type
  useEffect(() => {
    if (!users) return;

    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.id.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => 
        user.activity === (statusFilter === 'active' ? 'Active' : 'Inactive')
      );
    }
    
    // Apply device type filter
    if (deviceTypeFilter !== 'all') {
      result = result.filter(user => 
        user.devices.some(device => device.deviceType === deviceTypeFilter)
      );
    }

    setFilteredUsers(result);
  }, [users, searchTerm, statusFilter, deviceTypeFilter]);
  
  // Get users by device type
  const getUsersByDeviceType = () => {
    if (!provider || !deviceTypes) return [];
    
    return provider.deviceTypes.map(deviceTypeCode => {
      const deviceType = deviceTypes.find(dt => dt.code === deviceTypeCode);
      const deviceTypeName = deviceType ? deviceType.name : deviceTypeCode;
      
      const usersWithDeviceType = users.filter(user => 
        user.devices.some(device => device.deviceType === deviceTypeCode)
      );
      
      return {
        code: deviceTypeCode,
        name: deviceTypeName,
        count: usersWithDeviceType.length
      };
    });
  };
  
  // Get device type name
  const getDeviceTypeName = (code: string) => {
    const deviceType = deviceTypes.find(dt => dt.code === code);
    return deviceType ? deviceType.name : code;
  };
  
  // Open remove user dialog
  const openRemoveDialog = (user: User) => {
    setSelectedUser(user);
    setIsRemoveDialogOpen(true);
  };
  
  // Handle removing a user from provider
  const handleRemoveUser = () => {
    if (!selectedUser) return;
    
    try {
      // Update user in localStorage
      const allUsers = getFromStorage<User[]>('users', []);
      const updatedUsers = allUsers.map(user => 
        user.id === selectedUser.id 
          ? { ...user, providerId: '', activity: 'Inactive' as const } 
          : user
      );
      
      saveToStorage('users', updatedUsers);
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setFilteredUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      
      // Update provider's usersCount
      const providers = getFromStorage<Provider[]>('providers', []);
      const updatedProviders = providers.map(p => 
        p.id === providerId 
          ? { ...p, usersCount: p.usersCount - 1 } 
          : p
      );
      
      saveToStorage('providers', updatedProviders);
      
      // Update local provider state
      if (provider) {
        setProvider({
          ...provider,
          usersCount: provider.usersCount - 1
        });
      }
      
      toast.success('User removed from provider successfully');
      setIsRemoveDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };
  
  // Handle viewing user details
  const handleViewUserDetails = (user: User) => {
    navigate(`/admin/user-details/${user.id}`);
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/provider-management');
  };
  
  // Get user devices by type
  const getUserDevicesByType = (user: User, deviceTypeCode: string) => {
    return user.devices.filter(device => device.deviceType === deviceTypeCode);
  };
  
  // Calculate statistics
  const calculateStatistics = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.activity === 'Active').length;
    const inactiveUsers = totalUsers - activeUsers;
    
    const deviceTypeCounts = provider?.deviceTypes.reduce((acc, deviceType) => {
      const count = users.filter(user => 
        user.devices.some(device => device.deviceType === deviceType)
      ).length;
      
      return { ...acc, [deviceType]: count };
    }, {}) || {};
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      deviceTypeCounts
    };
  };
  
  const stats = calculateStatistics();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading users...</span>
      </div>
    );
  }
  
  if (!provider) {
    return (
      <div className="container p-6 mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="py-10 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
              <h2 className="mb-2 text-xl font-semibold">Provider Not Found</h2>
              <p className="mb-4 text-muted-foreground">
                The provider you're looking for doesn't exist.
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Providers
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
              Users for {provider.name}
            </CardTitle>
            <CardDescription>
              Manage users for provider {provider.id}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid gap-4 mb-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactiveUsers}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={deviceTypeFilter}
              onValueChange={setDeviceTypeFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Device Types</SelectItem>
                {provider.deviceTypes.map(code => (
                  <SelectItem key={code} value={code}>
                    {getDeviceTypeName(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left uppercase">User ID</TableHead>
                    <TableHead className="text-left uppercase">Name</TableHead>
                    <TableHead className="text-left uppercase">Age</TableHead>
                    <TableHead className="text-left uppercase">Gender</TableHead>
                    <TableHead className="text-left uppercase">Status</TableHead>
                    <TableHead className="text-left uppercase">Devices</TableHead>
                    <TableHead className="text-center uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.age}</TableCell>
                      <TableCell>{user.gender}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.activity === 'Active' ? 'default' : 'secondary'}
                        >
                          {user.activity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.devices.length === 0 ? (
                            <span className="text-sm text-muted-foreground">No devices</span>
                          ) : (
                            user.devices.map((device) => (
                              <Badge key={device.deviceId} variant="outline">
                                {device.deviceId}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUserDetails(user)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRemoveDialog(user)}
                          >
                            <UserX className="w-4 h-4 mr-1" /> Remove
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
      
      {/* Remove User Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user from the provider? This will set the user's status to inactive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveUser}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}