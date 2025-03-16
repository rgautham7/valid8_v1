import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, LogIn, User, Users, Shield } from 'lucide-react';

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

// Auth Context
import { useAuth } from '../../context/AuthContext';

// Import mock data only for initialization
import { providers as mockProviders, users as mockUsers, deviceTypes as mockDeviceTypes, devices as mockDevices, deviceUsages } from '../../data/mockData';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams<{ role?: 'user' | 'provider' | 'admin' }>();
  
  // State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'user' | 'provider' | 'admin'>('user');
  
  // Set active tab based on role parameter
  useEffect(() => {
    if (role && ['user', 'provider', 'admin'].includes(role)) {
      setActiveTab(role as 'user' | 'provider' | 'admin');
    }
  }, [role]);
  
  // Initialize localStorage with mock data if not already present
  useEffect(() => {
    if (!localStorage.getItem('providers')) {
      localStorage.setItem('providers', JSON.stringify(mockProviders));
    }
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }
    if (!localStorage.getItem('deviceTypes')) {
      localStorage.setItem('deviceTypes', JSON.stringify(mockDeviceTypes));
    }
    if (!localStorage.getItem('devices')) {
      localStorage.setItem('devices', JSON.stringify(mockDevices));
    }
    if (!localStorage.getItem('deviceUsages')) {
      localStorage.setItem('deviceUsages', JSON.stringify(deviceUsages));
    }
    
    // Load available provider IDs from localStorage
    try {
      const providersData = localStorage.getItem('providers');
      if (providersData) {
        const providers = JSON.parse(providersData);
        const providerIds = providers.map((provider: any) => provider.id);
        setAvailableProviders(providerIds);
      }
      
      // Load available user IDs from localStorage
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const userIds = users.map((user: any) => user.id);
        setAvailableUsers(userIds);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);
  
  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast.success('Login successful');
        
        // Redirect based on role
        if (activeTab === 'admin' || username === 'admin') {
          navigate('/admin/dashboard');
        } else if (activeTab === 'provider' || availableProviders.includes(username) || username === 'provider_a@example.com') {
          navigate('/provider/home');
        } else if (activeTab === 'user' || availableUsers.includes(username)) {
          navigate('/user/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      } else {
        // Check if user exists in localStorage
        if (activeTab === 'user' && !availableUsers.includes(username)) {
          toast.error('User not found. Please check your ID');
        } else {
          toast.error('Invalid username or password');
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
                  <Label htmlFor="username">User ID</Label>
                  <Input
                    id="username"
                    placeholder="Enter your User ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                  {availableUsers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Available User IDs: {availableUsers.join(', ')}
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="provider" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-id">Provider ID</Label>
                  <Input
                    id="provider-id"
                    placeholder="Enter your Provider ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                  {availableProviders.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Available Provider IDs: {availableProviders.join(', ')}
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="admin" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Admin Username</Label>
                  <Input
                    id="admin-username"
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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