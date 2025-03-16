// src/pages/admin/ProviderManagement.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useToast } from '../../hooks/use-toast';
import { Provider } from '../../types';
import ProviderAddModal from './ProviderAddModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import ProviderViewModal from './ProviderViewModal';
import Breadcrumb from '../../components/ui/breadcrumb';

const ProviderManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for providers
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProviderId, setViewProviderId] = useState<string | null>(null);
  
  // Load providers from localStorage
  useEffect(() => {
    const loadProviders = () => {
      try {
        const storedProviders = localStorage.getItem('providers');
        if (storedProviders) {
          const parsedProviders = JSON.parse(storedProviders);
          setProviders(parsedProviders);
          setFilteredProviders(parsedProviders);
        }
      } catch (error) {
        console.error('Error loading providers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load providers',
          variant: 'destructive',
        });
      }
    };
    
    loadProviders();
  }, [toast]);
  
  // Filter providers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProviders(providers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = providers.filter(
        provider => 
          provider.name.toLowerCase().includes(query) ||
          provider.id.toLowerCase().includes(query)
      );
      setFilteredProviders(filtered);
    }
  }, [searchQuery, providers]);
  
  // Handle adding a new provider
  const handleAddProvider = (provider: Provider) => {
    try {
      const updatedProviders = [...providers, provider];
      setProviders(updatedProviders);
      localStorage.setItem('providers', JSON.stringify(updatedProviders));
      
      toast({
        title: 'Success',
        description: 'Provider added successfully',
      });
      
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to add provider',
        variant: 'destructive',
      });
    }
  };
  
  // Handle editing a provider
  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsAddModalOpen(true);
  };
  
  // Handle updating a provider
  const handleUpdateProvider = (updatedProvider: Provider) => {
    try {
      const updatedProviders = providers.map(p => 
        p.id === updatedProvider.id ? updatedProvider : p
      );
      
      setProviders(updatedProviders);
      localStorage.setItem('providers', JSON.stringify(updatedProviders));
      
      toast({
        title: 'Success',
        description: 'Provider updated successfully',
      });
      
      setIsAddModalOpen(false);
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error updating provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to update provider',
        variant: 'destructive',
      });
    }
  };
  
  // Open delete confirmation dialog
  const openDeleteConfirm = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle deleting a provider
  const handleDeleteProvider = () => {
    if (!selectedProvider) return;
    
    try {
      const updatedProviders = providers.filter(p => p.id !== selectedProvider.id);
      setProviders(updatedProviders);
      localStorage.setItem('providers', JSON.stringify(updatedProviders));
      
      toast({
        title: 'Success',
        description: 'Provider deleted successfully',
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete provider',
        variant: 'destructive',
      });
    }
  };
  
  // Handle viewing provider users
  const handleViewUsers = (provider: Provider) => {
    navigate(`/admin/provider-users/${provider.id}`);
  };
  
  // Handle viewing provider details
  const handleViewProvider = (provider: Provider) => {
    setViewProviderId(provider.id);
    setIsViewModalOpen(true);
  };
  
  // Update any navigation to the admin dashboard
  const handleBackToAdmin = () => {
    navigate('/admin'); // Instead of '/admin/dashboard'
  };
  
  // Add breadcrumbs to the component
  const breadcrumbItems = [
    { title: 'Dashboard', path: '/admin' },
    { title: 'Provider Management', path: '/admin/provider-management' }
  ];
  
  return (
    <div className="container p-6 mx-auto">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Provider Management</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Providers</CardTitle>
          <CardDescription>
            Manage healthcare providers in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="w-4 h-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Device Types</TableHead>
                  <TableHead>Users Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-4 text-center">
                      No providers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>{provider.id}</TableCell>
                      <TableCell>{provider.name}</TableCell>
                      <TableCell>{provider.age}</TableCell>
                      <TableCell>{provider.deviceTypes.join(', ')}</TableCell>
                      <TableCell>{provider.usersCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewProvider(provider)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewUsers(provider)}
                            title="View Users"
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditProvider(provider)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteConfirm(provider)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Provider Modal */}
      {isAddModalOpen && (
        <ProviderAddModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedProvider(null);
          }}
          onSave={selectedProvider ? handleUpdateProvider : handleAddProvider}
          provider={selectedProvider}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the provider "{selectedProvider?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProvider(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProvider}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* View Provider Modal */}
      {isViewModalOpen && viewProviderId && (
        <ProviderViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewProviderId(null);
          }}
          providerId={viewProviderId}
        />
      )}
    </div>
  );
};

export default ProviderManagement;