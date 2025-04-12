
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  authenticateWithRadius, 
  isRadiusConfigured, 
  isRadiusAdmin,
  getAllRadiusUsers,
  registerRadiusUser
} from '@/services/radiusService';

interface User {
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  users: User[];
  register: (username: string, password: string, isAdmin?: boolean) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check for logged-in user in local storage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('guestMode') === 'true';
  });

  const [users, setUsers] = useState<User[]>([]);

  // Periodically refresh users list
  useEffect(() => {
    const refreshUsers = () => {
      // Get all users from RADIUS (for demo purposes)
      const radiusUsers = getAllRadiusUsers();
      const formattedUsers = radiusUsers.map((u: any) => ({
        username: u.username,
        isAdmin: isRadiusAdmin(u.username)
      }));
      setUsers(formattedUsers);
    };
    
    refreshUsers(); // Load users immediately
    const interval = setInterval(refreshUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const isAuthenticated = !!user;

  const login = (username: string, password: string): boolean => {
    // Authenticate using RADIUS
    const isAuthenticated = authenticateWithRadius(username, password);
    
    if (isAuthenticated) {
      const isAdmin = isRadiusAdmin(username);
      const userObj = { username, isAdmin };
      setUser(userObj);
      setIsGuest(false);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.removeItem('guestMode');
      return true;
    }
    
    return false;
  };

  const register = (username: string, password: string, isAdmin: boolean = false): boolean => {
    // Register user using RADIUS
    const success = registerRadiusUser(username, password, isAdmin);
    
    if (success) {
      // Automatically log in the user after registration
      const userObj = { username, isAdmin };
      setUser(userObj);
      setIsGuest(false);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.removeItem('guestMode');
    }
    
    return success;
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('user');
    localStorage.removeItem('guestMode');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('guestMode', 'true');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      isGuest, 
      continueAsGuest,
      users,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useIsRadiusReady = () => {
  return isRadiusConfigured();
};
