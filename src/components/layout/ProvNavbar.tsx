import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  UserPlus, 
  Cpu, 
  FileUp, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '../ui/sheet';

const ProvNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, providerData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login/provider');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Logo and Title */}
        <div className="flex items-center">
          <Link to="/provider/home" className="text-xl font-bold text-indigo-600">
            Valid8
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-4">
          <Link
            to="/provider/home"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/provider/home')
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
          <Link
            to="/provider/add-user"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/provider/add-user')
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Link>
          <Link
            to="/provider/manage-devices"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/provider/manage-devices')
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Cpu className="w-4 h-4 mr-2" />
            Manage Devices
          </Link>
          <Link
            to="/provider/file-upload"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/provider/file-upload')
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <FileUp className="w-4 h-4 mr-2" />
            Upload Data
          </Link>
        </nav>

        {/* Provider Info and Logout (Desktop) */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <div className="text-sm font-medium text-gray-700">
            {providerData?.name || 'Provider'}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Valid8</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <div className="mb-4 text-sm font-medium text-gray-700">
                Hello, {providerData?.name || 'Provider'}
              </div>
              <nav className="flex flex-col space-y-1">
                <SheetClose asChild>
                  <Link
                    to="/provider/home"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/provider/home')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/provider/add-user"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/provider/add-user')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/provider/manage-devices"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/provider/manage-devices')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    Manage Devices
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/provider/file-upload"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/provider/file-upload')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Upload Data
                  </Link>
                </SheetClose>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <SheetClose asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </SheetClose>
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default ProvNavbar;