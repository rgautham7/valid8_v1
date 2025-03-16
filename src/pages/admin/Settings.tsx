import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Settings as SettingsIcon, Users, Database, Upload } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="device-types" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="device-types">Device Types</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="device-types">
          <Card>
            <CardHeader>
              <CardTitle>Device Type Management</CardTitle>
              <CardDescription>
                Manage device types in the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Device Type Management</CardTitle>
                    <CardDescription>
                      View, add, edit, and delete device types
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/admin/device-type-management')}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Manage Device Types
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Bulk Upload</CardTitle>
                    <CardDescription>
                      Upload multiple device types at once
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/admin/bulk-upload')}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Provider Management</CardTitle>
              <CardDescription>
                Manage healthcare providers in the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Provider Management</CardTitle>
                    <CardDescription>
                      View, add, edit, and delete providers
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/admin/provider-management')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Providers
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Bulk Upload</CardTitle>
                    <CardDescription>
                      Upload multiple providers at once
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/admin/provider-bulk-upload')}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users in the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>User management features will be implemented in future updates.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

