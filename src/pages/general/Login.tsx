import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, LogIn, User, Users, Shield, Phone } from 'lucide-react';
import { Provider, User as UserType } from '../../types';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Auth Context
import { useAuth } from '../../context/AuthContext';

// Import mock data only for initialization
import { providers as mockProviders, users as mockUsers, deviceTypes as mockDeviceTypes, devices as mockDevices, deviceUsages } from '../../data/mockData';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams<{ role?: 'user' | 'provider' | 'admin' }>();
  
  // State
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'id' | 'mobile'>('id');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<{id: string, mobile: string}[]>([]);
  const [availableUsers, setAvailableUsers] = useState<{id: string, mobile: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'user' | 'provider' | 'admin'>('user');
  
  // Set active tab based on role parameter
  useEffect(() => {
    if (role && ['user', 'provider', 'admin'].includes(role)) {
      setActiveTab(role as 'user' | 'provider' | 'admin');
    }
  }, [role]);
  
  // Initialize localStorage with mock data if not already present
  useEffect(() => {
    // Call our update function to ensure mobile numbers are added
    updateLocalStorageWithMobileNumbers();
    
    // The rest of the existing initialization code...
    if (!localStorage.getItem('deviceTypes')) {
      localStorage.setItem('deviceTypes', JSON.stringify(mockDeviceTypes));
    }
    if (!localStorage.getItem('devices')) {
      localStorage.setItem('devices', JSON.stringify(mockDevices));
    }
    if (!localStorage.getItem('deviceUsages')) {
      localStorage.setItem('deviceUsages', JSON.stringify(deviceUsages));
    }
    
    // Load available provider IDs and mobile numbers from localStorage
    try {
      const providersData = localStorage.getItem('providers');
      if (providersData) {
        const providers = JSON.parse(providersData);
        const providerInfo = providers.map((provider: any) => ({
          id: provider.id,
          mobile: provider.mobileNo
        }));
        setAvailableProviders(providerInfo);
      }
      
      // Load available user IDs and mobile numbers from localStorage
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const userInfo = users.map((user: any) => ({
          id: user.id,
          mobile: user.mobileNo
        }));
        setAvailableUsers(userInfo);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);
  
  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast.error('Please enter both identifier and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(identifier, password);
      
      if (success) {
        toast.success('Login successful');
        
        // Redirect based on role
        if (activeTab === 'admin' || identifier === 'admin') {
          navigate('/admin/dashboard');
        } else if (activeTab === 'provider' || 
                  availableProviders.some(p => p.id === identifier || p.mobile === identifier) || 
                  identifier === 'provider_a@example.com') {
          navigate('/provider/home');
        } else if (activeTab === 'user' || 
                  availableUsers.some(u => u.id === identifier || u.mobile === identifier)) {
          navigate('/user/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      } else {
        // Check if user exists in localStorage
        if (activeTab === 'user' && 
            !availableUsers.some(u => u.id === identifier || u.mobile === identifier)) {
          toast.error('User not found. Please check your ID or mobile number');
        } else {
          toast.error('Invalid credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login to Valid8</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as 'user' | 'provider' | 'admin')}>
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                User
              </TabsTrigger>
              <TabsTrigger value="provider" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Provider
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>
          </div>
          
          <form onSubmit={handleLogin}>
            <CardContent className="mt-4 space-y-4">
              <TabsContent value="user" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="identifier-type">Login with</Label>
                    <Select
                      value={identifierType}
                      onValueChange={(value) => setIdentifierType(value as 'id' | 'mobile')}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select login method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">User ID</SelectItem>
                        <SelectItem value="mobile">Mobile Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Label htmlFor="user-identifier">
                    {identifierType === 'id' ? 'User ID' : 'Mobile Number'}
                  </Label>
                  <Input
                    id="user-identifier"
                    placeholder={identifierType === 'id' ? "Enter your User ID" : "Enter your mobile number"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                    type={identifierType === 'mobile' ? "tel" : "text"}
                  />
                  
                  {availableUsers.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p>Available User IDs: {availableUsers.map(u => u.id).join(', ')}</p>
                      <p>Available Mobile Numbers: {availableUsers.map(u => u.mobile).join(', ')}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="provider" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="identifier-type">Login with</Label>
                    <Select
                      value={identifierType}
                      onValueChange={(value) => setIdentifierType(value as 'id' | 'mobile')}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select login method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Provider ID</SelectItem>
                        <SelectItem value="mobile">Mobile Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Label htmlFor="provider-identifier">
                    {identifierType === 'id' ? 'Provider ID' : 'Mobile Number'}
                  </Label>
                  <Input
                    id="provider-identifier"
                    placeholder={identifierType === 'id' ? "Enter your Provider ID" : "Enter your mobile number"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                    type={identifierType === 'mobile' ? "tel" : "text"}
                  />
                  
                  {availableProviders.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p>Available Provider IDs: {availableProviders.map(p => p.id).join(', ')}</p>
                      <p>Available Mobile Numbers: {availableProviders.map(p => p.mobile).join(', ')}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="admin" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Admin Username</Label>
                  <Input
                    id="admin-username"
                    placeholder="Enter admin username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use 'admin' for admin login
                  </p>
                </div>
              </TabsContent>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeTab === 'user' && "Use 'user123' for user accounts"}
                  {activeTab === 'provider' && "Use 'provider123' for provider accounts"}
                  {activeTab === 'admin' && "Use 'admin123' for admin account"}
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Logging in...</span>
                    <span className="animate-spin">⏳</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </CardFooter>
          </form>
        </Tabs>
      </Card>
    </div>
  );
}

// Add this function to initialize or update localStorage with the new mock data
function updateLocalStorageWithMobileNumbers() {
  // First, check if localStorage already has data
  const existingProviders = localStorage.getItem('providers');
  const existingUsers = localStorage.getItem('users');
  
  // Update providers with mobile numbers
  if (existingProviders) {
    try {
      const providers = JSON.parse(existingProviders);
      // Add mobile numbers to existing providers
      const updatedProviders = providers.map((provider: Provider, index: number) => ({
        ...provider,
        mobileNo: provider.mobileNo || `987654321${index}` // Add mobile if not exists
      }));
      localStorage.setItem('providers', JSON.stringify(updatedProviders));
    } catch (error) {
      console.error('Error updating providers:', error);
      // If error, replace with new mock data
      localStorage.setItem('providers', JSON.stringify(mockProviders));
    }
  } else {
    // If no existing data, use mock data
    localStorage.setItem('providers', JSON.stringify(mockProviders));
  }
  
  // Update users with mobile numbers
  if (existingUsers) {
    try {
      const users = JSON.parse(existingUsers);
      // Add mobile numbers to existing users
      const updatedUsers = users.map((user: UserType, index: number) => ({
        ...user,
        mobileNo: user.mobileNo || `987650000${index + 1}` // Add mobile if not exists
      }));
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error updating users:', error);
      // If error, replace with new mock data
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }
  } else {
    // If no existing data, use mock data
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
}