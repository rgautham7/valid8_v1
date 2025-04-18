import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "../../components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Textarea } from "../../components/ui/textarea" 
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  MessageSquare,
  Smartphone
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { DeviceType, Device, Provider } from '../../types';
import { toast } from "react-hot-toast";

// Form validation schema
const formSchema = z.object({
  userName: z.string().min(2, "Username must be at least 2 characters"),
  userId: z.string().min(1, "User ID is required"),
  gender: z.enum(["male", "female", "other"]),
  age: z.number().min(1, "Age is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional(),
  deviceTypeCode: z.string().optional(),
  deviceId: z.string().optional(),
  frequency: z.enum(["Daily", "Twice a week", "Once a week"]).default("Daily"),
  remarks: z.string().optional(),
  activity: z.string().default("Active")
});

// Function to get auth data directly from localStorage
const getAuthData = () => {
  try {
    const authData = localStorage.getItem('authData');
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    return null;
  }
};

const AddUser = () => {
  const navigate = useNavigate();
  
  const [providerId, setProviderId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceTypeSelected, setDeviceTypeSelected] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      userId: `USR_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      gender: "male",
      age: 30,
      mobile: "",
      email: "",
      deviceTypeCode: undefined,
      deviceId: undefined,
      frequency: "Daily",
      remarks: "",
      activity: "Active"
    },
  });
  
  // Watch for device type changes
  const selectedDeviceType = form.watch("deviceTypeCode");

  // Get provider ID from localStorage on component mount
  useEffect(() => {
    const authData = getAuthData();
    if (authData && authData.userRole === 'provider' && authData.providerId) {
      setProviderId(authData.providerId);
    } else {
      toast.error("Provider authentication data not found");
      navigate('/login/provider');
    }
  }, [navigate]);

  // Load provider data and device types
  useEffect(() => {
    const loadData = async () => {
      if (!providerId) return;
      
      setLoading(true);
      try {
        // Load provider data
        const providersData = localStorage.getItem('providers');
        if (!providersData) {
          toast.error("Provider data not available");
          return;
        }

        const providers: Provider[] = JSON.parse(providersData);
        const currentProvider = providers.find(p => p.id === providerId);

        if (!currentProvider) {
          toast.error("Provider not found");
          return;
        }

        setProvider(currentProvider);

        // Load device types
        const deviceTypesData = localStorage.getItem('deviceTypes');
        if (deviceTypesData) {
          const allDeviceTypes: DeviceType[] = JSON.parse(deviceTypesData);
          const providerDeviceTypes = allDeviceTypes.filter(dt => 
            currentProvider.deviceTypes.includes(dt.code)
          );
          setDeviceTypes(providerDeviceTypes);
        }

        // Load all devices (we'll filter them later based on device type)
        loadAvailableDevices();
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [providerId]);

  // Load all available devices
  const loadAvailableDevices = () => {
    try {
      const devicesData = localStorage.getItem('devices');
      if (!devicesData) {
        toast.error("Device data not available");
        return;
      }

      const allDevices: Device[] = JSON.parse(devicesData);
      
      // Filter devices that are:
      // 1. Allocated to this provider (providerAllocation matches providerId)
      // 2. Either not allocated to any user OR inactive
      const availDevices = allDevices.filter(device => {
        const isAllocatedToProvider = device.providerAllocation === providerId;
        const isAvailableForUser = device.allocation === 'not allocated' || device.status === 'inactive';
        
        return isAllocatedToProvider && isAvailableForUser;
      });
      
      setAvailableDevices(availDevices);
      console.log("Available devices loaded:", availDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
      toast.error('Failed to load devices');
    }
  };

  // Update filtered devices when device type changes
  useEffect(() => {
    if (selectedDeviceType) {
      setDeviceTypeSelected(true);
      
      // Find the device type object by code
      const selectedTypeObj = deviceTypes.find(dt => dt.code === selectedDeviceType);
      
      if (selectedTypeObj) {
        // Filter devices that match the selected device type ID and are either:
        // 1. Not allocated and active, OR
        // 2. Inactive (regardless of allocation)
        const filtered = availableDevices.filter(device => {
          return device.deviceTypeId === selectedTypeObj.id && 
                (device.allocation === 'not allocated' || device.status === 'inactive');
        });
        
        console.log("Selected device type:", selectedTypeObj);
        console.log("Filtered devices:", filtered);
        
        setFilteredDevices(filtered);
      } else {
        setFilteredDevices([]);
      }
      
      // Reset device ID when device type changes
      form.setValue('deviceId', undefined);
    } else {
      setDeviceTypeSelected(false);
      setFilteredDevices([]);
    }
  }, [selectedDeviceType, availableDevices, deviceTypes, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!providerId) {
      toast.error("Provider ID not available");
      return;
    }

    // Validate device type is selected if device is selected
    if (values.deviceId && values.deviceId !== 'no_device' && !values.deviceTypeCode) {
      form.setError('deviceTypeCode', {
        type: 'manual',
        message: 'Please select a device type first'
      });
      return;
    }

    try {
      // Get selected device and device type information
      const selectedDevice = values.deviceId && values.deviceId !== 'no_device' ? 
        availableDevices.find(d => d.id === values.deviceId) : null;
      
      const selectedTypeCode = values.deviceTypeCode || '';
      
      // Create new user object with frequency field
      const newUser = {
        id: values.userId,
        name: values.userName,
        age: values.age,
        gender: values.gender === 'male' ? 'M' : values.gender === 'female' ? 'F' : 'O',
        providerId: providerId,
        activity: values.activity,
        mobileNo: values.mobile,
        email: values.email || undefined,
        frequency: values.frequency,
        devices: selectedDevice ? [
          {
            deviceId: selectedDevice.id,
            deviceType: selectedTypeCode,
            allocatedOn: new Date().toISOString().split('T')[0],
            lastUsedOn: new Date().toISOString().split('T')[0]
          }
        ] : []
      };

      // Save new user to localStorage
      const usersData = localStorage.getItem('users');
      let users = usersData ? JSON.parse(usersData) : [];
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // If a device is allocated, update its status
      if (selectedDevice) {
        const devicesData = localStorage.getItem('devices');
        if (devicesData) {
          const devices = JSON.parse(devicesData);
          const updatedDevices = devices.map((device: Device) => {
            if (device.id === selectedDevice.id) {
              return {
                ...device,
                status: 'active',
                allocation: 'allocated',
                allocatedTo: values.userId,
                lastUsedOn: new Date().toISOString().split('T')[0]
              };
            }
            return device;
          });
          localStorage.setItem('devices', JSON.stringify(updatedDevices));
        }
      }

      // Update provider's user count
      if (provider) {
        const providersData = localStorage.getItem('providers');
        if (providersData) {
          const providers = JSON.parse(providersData);
          const updatedProviders = providers.map((p: Provider) => {
            if (p.id === providerId) {
              return {
                ...p,
                usersCount: (p.usersCount || 0) + 1
              };
            }
            return p;
          });
          localStorage.setItem('providers', JSON.stringify(updatedProviders));
        }
      }

      toast.success('User registered successfully');
    navigate('/provider');
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error('Failed to register user');
    }
  };

  // Custom validation for device selection
  const validateDeviceSelection = () => {
    if (form.getValues('deviceTypeCode') && !form.getValues('deviceId')) {
      form.setError('deviceId', {
        type: 'manual',
        message: 'Please select a device after selecting device type'
      });
    } else if (!form.getValues('deviceTypeCode') && form.getValues('deviceId') && form.getValues('deviceId') !== 'no_device') {
      form.setError('deviceTypeCode', {
        type: 'manual',
        message: 'Please select a device type first'
      });
    }
  };

  // Simple loading indicator
  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen mx-auto">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full border-t-blue-500 animate-spin"></div>
      </div>
    );
  }

  // Content display
  return (
    <div className="container px-4 py-10 mx-auto">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="border-b">
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="p-6 space-y-6 rounded-lg bg-gray-50">
                <h3 className="pl-3 text-lg font-semibold border-l-4 border-primary">Provider Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider Name</label>
                          <div className="relative">
                            <User className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                        value={provider?.name || ""} 
                              readOnly 
                        className="pl-9 bg-muted"
                            />
                          </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider ID</label>
                          <div className="relative">
                            <CreditCard className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                        value={provider?.id || ""} 
                              readOnly 
                        className="pl-9 bg-muted"
                            />
                          </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile Number</label>
                          <div className="relative">
                            <Phone className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                        value={provider?.mobileNo || ""} 
                              readOnly 
                        className="pl-9 bg-muted"
                            />
                          </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Specialization</label>
                          <div className="relative">
                            <Input 
                        value={provider?.specialistIn || ""} 
                              readOnly 
                        className="pl-3 bg-muted"
                            />
                          </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 rounded-lg bg-gray-50">
                <h3 className="pl-3 text-lg font-semibold border-l-4 border-primary">User Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="Enter username" 
                              {...field} 
                              className="pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              {...field} 
                              className="pl-9"
                              disabled
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="male" />
                              </FormControl>
                              <FormLabel className="font-normal">Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="female" />
                              </FormControl>
                              <FormLabel className="font-normal">Female</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="other" />
                              </FormControl>
                              <FormLabel className="font-normal">Other</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                            <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                            </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="p-6 space-y-6 rounded-lg bg-gray-50">
                <h3 className="pl-3 text-lg font-semibold border-l-4 border-primary">Contact Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Smartphone className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="Enter mobile number" 
                              {...field} 
                              className="pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="Enter email address" 
                              type="email" 
                              {...field} 
                              className="pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="p-6 space-y-6 rounded-lg bg-gray-50">
                <h3 className="pl-3 text-lg font-semibold border-l-4 border-primary">Device Allocation</h3>
                
                  <FormField
                    control={form.control}
                  name="deviceTypeCode"
                    render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                            <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a device type" />
                          </SelectTrigger>
                            </FormControl>
                        <SelectContent>
                          {provider?.deviceTypes.map(code => {
                            const deviceType = deviceTypes.find(dt => dt.code === code);
                            return (
                              <SelectItem key={code} value={code}>
                                {deviceType?.name || code}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                  name="deviceId"
                    render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allocate Device (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!deviceTypeSelected}
                        onOpenChange={() => {
                          if (!deviceTypeSelected) {
                            form.setError('deviceTypeCode', {
                              type: 'manual',
                              message: 'Select device type first'
                            });
                          }
                        }}
                      >
                            <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={deviceTypeSelected ? "Select a device to allocate" : "Select device type first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no_device">No device</SelectItem>
                          {filteredDevices.length > 0 ? (
                            filteredDevices.map(device => {
                              const deviceType = deviceTypes.find(dt => dt.id === device.deviceTypeId);
                              const deviceStatus = device.status === 'inactive' ? ' (Inactive)' : '';
                              return (
                                <SelectItem key={device.id} value={device.id}>
                                  {device.id} - {deviceType?.name || device.deviceTypeId}{deviceStatus}
                                </SelectItem>
                              );
                            })
                          ) : (
                            deviceTypeSelected && <SelectItem value="no_available" disabled>No available devices</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {!deviceTypeSelected && field.value && (
                        <p className="text-sm font-medium text-destructive">Select device type first</p>
                      )}
                      {deviceTypeSelected && filteredDevices.length === 0 && (
                        <p className="text-sm font-medium text-amber-500">No available devices for this device type</p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Frequency</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select usage frequency" />
                          </SelectTrigger>
                            </FormControl>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Twice a week">Twice a week</SelectItem>
                          <SelectItem value="Once a week">Once a week</SelectItem>
                        </SelectContent>
                      </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquare className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                          <Textarea 
                            placeholder="Add any additional notes" 
                            {...field} 
                            className="pl-9"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center pt-6 space-x-4">
                <Button 
                  type="submit" 
                  onClick={() => validateDeviceSelection()}
                >
                  Register User
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/provider/upload')}
                >
                  Add as Bulk
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => navigate('/provider')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddUser;