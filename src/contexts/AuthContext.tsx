
import React, { createContext, useState, useContext, useEffect } from 'react';

type User = {
  username: string;
  id: string;
  isAdmin?: boolean;
};

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string, isAdmin?: boolean) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  users: User[];
  isRegistrationAllowed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real app, we would check localStorage or a session cookie on load
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('guestMode') === 'true';
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState<boolean>(() => {
    const settings = localStorage.getItem('adminSettings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      return parsedSettings.allowRegistration;
    }
    return true; // Default to allowing registration
  });

  useEffect(() => {
    // Listen for changes in admin settings
    const handleStorageChange = () => {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setIsRegistrationAllowed(parsedSettings.allowRegistration);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check local storage for admin settings on mount
  useEffect(() => {
    const settings = localStorage.getItem('adminSettings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      setIsRegistrationAllowed(parsedSettings.allowRegistration);
    }
  }, []);

  const isAuthenticated = !!user;

  // Modified register function that respects admin settings
  const register = (username: string, password: string, isAdmin = false): boolean => {
    // Check if registration is allowed (unless it's an admin account when no users exist)
    if (!isAdmin && !isRegistrationAllowed) {
      return false;
    }

    // Very simple validation - in a real app this would verify against a database
    if (username.length >= 3 && password.length >= 6) {
      // Check if username already exists
      if (users.some(u => u.username === username)) {
        return false;
      }

      const newUser = { username, id: Date.now().toString(), isAdmin };
      const updatedUsers = [...users, newUser];
      
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Auto-login the new user
      setUser(newUser);
      setIsGuest(false);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.removeItem('guestMode');
      
      return true;
    }
    return false;
  };

  // Mock login function - in a real app this would call an API
  const login = (username: string, password: string): boolean => {
    // Very simple validation - in a real app this would verify against a database
    const foundUser = users.find(u => u.username === username);
    
    if (foundUser) {
      setUser(foundUser);
      setIsGuest(false);
      localStorage.setItem('user', JSON.stringify(foundUser));
      localStorage.removeItem('guestMode');
      return true;
    }
    return false;
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
      register,
      logout, 
      isAuthenticated, 
      isGuest, 
      continueAsGuest,
      users,
      isRegistrationAllowed
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
