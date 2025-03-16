import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { initLocalStorage, verifyLocalStorageData } from './utils/initLocalStorage';

// General Pages
import Home from './pages/general/Home';
import Login from './pages/general/Login';
import Signup from './pages/general/Signup';

// Provider Pages
import AddUser from './pages/provider/AddUser';
import ProviderHome from './pages/provider/ProviderHome';
import ProvNavbar from './components/layout/ProvNavbar';
import ManageDevices from './pages/provider/ManageDevices';
import FileUpload from './pages/provider/FileUpload';
import FilePreview from './pages/provider/FilePreview';

// User Pages
import UserHome from './pages/user/UserHome';
import HowToUse from './pages/user/HowToUse';
import UserNavbar from './components/layout/UserNavbar';
import UserDeviceTypeManagement from './pages/user/DeviceTypeManagement';
import UsageHistoryPage from './pages/user/UsageHistoryPage';
import DeviceDetailsPage from './pages/user/DeviceDetailsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DeviceDetails from './pages/admin/DeviceDetails';
import DeviceTypeProviderUsers from './pages/admin/DeviceTypeProviderUsers';
import Settings from './pages/admin/Settings';
import DeviceTypeManagement from './pages/admin/DeviceTypeManagement';
import AddDeviceForm from './pages/admin/AddDeviceForm';
import BulkUpload from './pages/admin/BulkUpload';
import DevicePreview from './pages/admin/DevicePreview';
import AdminNavbar from './components/layout/AdminNavbar';
import ProviderManagement from './pages/admin/ProviderManagement';
import ProviderUsers from './pages/admin/ProviderUsers';
import DeviceManagement from './pages/admin/DeviceManagement';
import UserDetails from './pages/admin/UserDetails';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { UsageProvider } from './context/UsageContext';

const ProtectedRoute: React.FC<{ 
  element: React.ReactNode, 
  allowedRoles?: string[] 
}> = ({ element, allowedRoles = [] }) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    // Redirect to role-specific login pages
    if (allowedRoles.includes('admin')) {
      return <Navigate to="/login/admin" replace />;
    } else if (allowedRoles.includes('provider')) {
      return <Navigate to="/login/provider" replace />;
    } else if (allowedRoles.includes('user')) {
      return <Navigate to="/login/user" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole || '')) {
    // Redirect based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'provider') {
      return <Navigate to="/provider/home" replace />;
    } else if (userRole === 'user') {
      return <Navigate to="/user/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return <>{element}</>;
};

const App: React.FC = () => {
  useEffect(() => {
    // Initialize localStorage with mock data if it doesn't exist
    initLocalStorage();
    const verificationResults = verifyLocalStorageData();
    console.log('Verification Results:', verificationResults);
  }, []);
  
  return (
    <AuthProvider>
      <UsageProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          
          {/* Login Routes - Updated to support role-specific logins */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <AdminDashboard />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/device-details/:deviceId" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <DeviceDetails />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/device-type-provider-users/:deviceTypeId/:providerId" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <DeviceTypeProviderUsers />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <Settings />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/device-type-management" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <DeviceTypeManagement />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/add-device" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <AddDeviceForm />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/bulk-upload/:deviceTypeId" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <BulkUpload />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/device-preview/:deviceTypeId" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <DevicePreview />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/provider-management" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <ProviderManagement />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/provider-users/:providerId" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <ProviderUsers />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/device-management/:deviceTypeId" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <DeviceManagement />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/user-details/:userId" element={
            <ProtectedRoute 
              element={
                <>
                  <AdminNavbar />
                  <UserDetails />
                </>
              } 
              allowedRoles={['admin']} 
            />
          } />
          
          {/* Provider Routes */}
          <Route path="/provider" element={<Navigate to="/provider/home" replace />} />
          <Route path="/provider/home" element={
            <ProtectedRoute 
              element={
                <>
                  <ProvNavbar />
                  <ProviderHome />
                </>
              } 
              allowedRoles={['provider']} 
            />
          } />
          <Route path="/provider/add-user" element={
            <ProtectedRoute 
              element={
                <>
                  <ProvNavbar />
                  <AddUser />
                </>
              } 
              allowedRoles={['provider']} 
            />
          } />
          <Route path="/provider/manage-devices" element={
            <ProtectedRoute 
              element={
                <>
                  <ProvNavbar />
                  <ManageDevices />
                </>
              } 
              allowedRoles={['provider']} 
            />
          } />
          <Route path="/provider/file-upload" element={
            <ProtectedRoute 
              element={
                <>
                  <ProvNavbar />
                  <FileUpload />
                </>
              } 
              allowedRoles={['provider']} 
            />
          } />
          <Route path="/provider/file-preview" element={
            <ProtectedRoute 
              element={
                <>
                  <ProvNavbar />
                  <FilePreview />
                </>
              } 
              allowedRoles={['provider']} 
            />
          } />
          
          {/* User Routes */}
          <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="/user/dashboard" element={
            <ProtectedRoute 
              element={
                <>
                  <UserNavbar />
                  <UserHome />
                </>
              } 
              allowedRoles={['user']} 
            />
          } />
          <Route path="/user/devices" element={
            <ProtectedRoute 
              element={<UserDeviceTypeManagement />}
              allowedRoles={['user']} 
            />
          } />
          <Route path="/user/devices/:deviceId" element={
            <ProtectedRoute 
              element={<DeviceDetailsPage />}
              allowedRoles={['user']} 
            />
          } />
          <Route path="/user/usage-history" element={
            <ProtectedRoute 
              element={<UsageHistoryPage />}
              allowedRoles={['user']} 
            />
          } />
          <Route path="/user/how-to-use" element={
            <ProtectedRoute 
              element={<HowToUse />}
              allowedRoles={['user']} 
            />
          } />
          
          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Development Tools */}
        {process.env.NODE_ENV !== 'production' && <DevTools />}
      </Router>
      </UsageProvider>
    </AuthProvider>
  );
};

const DevTools: React.FC = () => {
  const handleReset = () => {
    try {
      localStorage.clear();
      initLocalStorage();
      alert('Data reset complete! Refreshing page...');
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset localStorage:', error);
      alert('Failed to reset data. See console for details.');
    }
  };
  
  const handleVerify = () => {
    try {
      const providers = JSON.parse(localStorage.getItem('providers') || '[]');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const deviceTypes = JSON.parse(localStorage.getItem('deviceTypes') || '[]');
      const devices = JSON.parse(localStorage.getItem('devices') || '[]');
      
      alert(`Data verification:\n- Device Types: ${deviceTypes.length}\n- Providers: ${providers.length}\n- Users: ${users.length}\n- Devices: ${devices.length}`);
    } catch (error) {
      console.error('Failed to verify localStorage:', error);
      alert('Failed to verify data. See console for details.');
    }
  };
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      zIndex: 9999,
      display: 'flex',
      gap: '5px'
    }}>
      <button 
        onClick={handleReset}
        style={{ 
          padding: '5px 10px', 
          backgroundColor: '#ff4d4f', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Reset Data
      </button>
      <button 
        onClick={handleVerify}
        style={{ 
          padding: '5px 10px', 
          backgroundColor: '#1677ff', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Verify Data
      </button>
    </div>
  );
};

export default App;