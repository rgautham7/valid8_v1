import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Provider } from '../types/index';

// Define the shape of our authentication context
interface AuthContextType {
  userId: string | null;
  providerId: string | null;
  setProviderId: (id: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
  userRole: 'provider' | 'user' | 'admin' | null;
  setUserRole: (role: 'provider' | 'user' | 'admin' | null) => void;
  login: (usernameOrMobile: string, password: string) => Promise<boolean>;
  userData: User | null;
  providerData: Provider | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  userId: null,
  providerId: null,
  setProviderId: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  logout: () => {},
  userRole: null,
  setUserRole: () => {},
  login: async () => false,
  userData: null,
  providerData: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'provider' | 'user' | 'admin' | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [providerData, setProviderData] = useState<Provider | null>(null);

  // Load user data based on userId
  const loadUserData = (id: string) => {
    try {
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const user = users.find((u: User) => u.id === id);
        if (user) {
          setUserData(user);
          return user;
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    return null;
  };

  // Load provider data based on providerId
  const loadProviderData = (id: string) => {
    try {
      const providersData = localStorage.getItem('providers');
      if (providersData) {
        const providers = JSON.parse(providersData);
        const provider = providers.find((p: Provider) => p.id === id);
        if (provider) {
          setProviderData(provider);
          return provider;
        }
      }
    } catch (error) {
      console.error('Error loading provider data:', error);
    }
    return null;
  };

  // Check if user is already logged in
  useEffect(() => {
    const storedAuth = localStorage.getItem('authData');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(authData.isAuthenticated || false);
        setUserRole(authData.userRole || null);
        setProviderId(authData.providerId || null);
        setUserId(authData.userId || null);
        
        // Load user data if user is logged in
        if (authData.userRole === 'user' && authData.userId) {
          loadUserData(authData.userId);
        }
        
        // Load provider data if provider is logged in
        if (authData.userRole === 'provider' && authData.providerId) {
          loadProviderData(authData.providerId);
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('authData');
      }
    }
  }, []);

  const login = async (usernameOrMobile: string, password: string): Promise<boolean> => {
    // Admin login
    if (usernameOrMobile === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      setUserRole('admin');
      setProviderId(null);
      setUserId(null);
      setUserData(null);
      setProviderData(null);
      
      // Store auth data
      localStorage.setItem('authData', JSON.stringify({
        isAuthenticated: true,
        userRole: 'admin',
        providerId: null,
        userId: null
      }));
      
      return true;
    }
    
    // Provider login - check if input matches any provider ID or mobile number in localStorage
    try {
      const providersData = localStorage.getItem('providers');
      if (providersData) {
        const providers = JSON.parse(providersData);
        const providerMatch = providers.find((provider: Provider) => 
          provider.id === usernameOrMobile || provider.mobileNo === usernameOrMobile
        );
        
        if (providerMatch && password === 'provider123') {
          setIsAuthenticated(true);
          setUserRole('provider');
          setProviderId(providerMatch.id);
          setUserId(null);
          setUserData(null);
          setProviderData(providerMatch);
          
          // Store auth data
          localStorage.setItem('authData', JSON.stringify({
            isAuthenticated: true,
            userRole: 'provider',
            providerId: providerMatch.id,
            userId: null
          }));
          
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking provider data:', error);
    }
    
    // Legacy provider login
    if (usernameOrMobile === 'provider_a@example.com' && password === 'provider123') {
      const providerId = 'PRV_A';
      setIsAuthenticated(true);
      setUserRole('provider');
      setProviderId(providerId);
      setUserId(null);
      setUserData(null);
      
      // Load provider data
      const provider = loadProviderData(providerId);
      
      // Store auth data
      localStorage.setItem('authData', JSON.stringify({
        isAuthenticated: true,
        userRole: 'provider',
        providerId: providerId,
        userId: null
      }));
      
      return true;
    }
    
    // User login - check if input matches any user ID or mobile number in localStorage
    try {
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const userMatch = users.find((user: User) => 
          user.id === usernameOrMobile || user.mobileNo === usernameOrMobile
        );
        
        if (userMatch && password === 'user123') {
          setIsAuthenticated(true);
          setUserRole('user');
          setProviderId(userMatch.providerId);
          setUserId(userMatch.id);
          setUserData(userMatch);
          setProviderData(null);
          
          // Store auth data
          localStorage.setItem('authData', JSON.stringify({
            isAuthenticated: true,
            userRole: 'user',
            providerId: userMatch.providerId,
            userId: userMatch.id
          }));
          
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking user data:', error);
    }
    
    // Legacy user login
    if (usernameOrMobile === 'user1@example.com' && password === 'user123') {
      const userId = 'USR_A1';
      setIsAuthenticated(true);
      setUserRole('user');
      setUserId(userId);
      
      // Load user data
      const user = loadUserData(userId);
      if (user) {
        setProviderId(user.providerId);
      }
      
      // Store auth data
      localStorage.setItem('authData', JSON.stringify({
        isAuthenticated: true,
        userRole: 'user',
        providerId: user?.providerId || null,
        userId: userId
      }));
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setProviderId(null);
    setUserId(null);
    setUserData(null);
    setProviderData(null);
    localStorage.removeItem('authData');
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        providerId,
        setProviderId,
        isAuthenticated,
        setIsAuthenticated,
        logout,
        userRole,
        setUserRole,
        login,
        userData,
        providerData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
