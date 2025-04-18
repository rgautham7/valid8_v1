import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  Menu, 
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useAuth } from '../../context/AuthContext';

const AdminNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      title: 'Device Types',
      href: '/admin/device-type-management',
      icon: <Database className="w-5 h-5" />
    },
    {
      title: 'Providers',
      href: '/admin/provider-management',
      icon: <Users className="w-5 h-5" />
    },
  ];
  
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login/admin');
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <div className="flex items-center">
          <Link to="/admin" className="flex items-center">
            <span className="text-xl font-bold">Valid8 Admin</span>
          </Link>
        </div>
        
        <nav className="items-center hidden space-x-4 md:flex lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
            >
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </Link>
          ))}
          
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-500 transition-colors rounded-md hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-2">Logout</span>
          </Button>
        </nav>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Valid8 Admin</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col mt-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Link>
              ))}
              
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-red-500 transition-colors rounded-md hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-2">Logout</span>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default AdminNavbar;