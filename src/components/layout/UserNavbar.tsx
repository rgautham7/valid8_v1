import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Smartphone, 
  Calendar, 
  HelpCircle, 
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

const UserNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login/user');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Logo and Title */}
        <div className="flex items-center">
          <Link to="/user/dashboard" className="text-xl font-bold text-blue-600">
            Valid8
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-4">
          <Link
            to="/user/dashboard"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/user/dashboard')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
          <Link
            to="/user/devices"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/user/devices') || location.pathname.startsWith('/user/devices/')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            My Devices
          </Link>
          <Link
            to="/user/usage-history"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/user/usage-history')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Usage History
          </Link>
          <Link
            to="/user/how-to-use"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/user/how-to-use')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            How to Use
          </Link>
        </nav>

        {/* User Info and Logout (Desktop) */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <div className="text-sm font-medium text-gray-700">
            {userData?.name || 'User'}
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
                Hello, {userData?.name || 'User'}
              </div>
              <nav className="flex flex-col space-y-1">
                <SheetClose asChild>
                  <Link
                    to="/user/dashboard"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/user/dashboard')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/user/devices"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/user/devices') || location.pathname.startsWith('/user/devices/')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    My Devices
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/user/usage-history"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/user/usage-history')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Usage History
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/user/how-to-use"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/user/how-to-use')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    How to Use
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

export default UserNavbar;