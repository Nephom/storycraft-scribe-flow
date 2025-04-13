
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authenticateUser, getAllUsers, createUser, initializeAuth, isRadiusConfigured } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  isRadiusConfigured: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (username: string, isAdmin?: boolean) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [radiusConfigured, setRadiusConfigured] = useState(false);

  useEffect(() => {
    // Initialize the auth service
    initializeAuth();
    
    // Check if RADIUS is configured
    setRadiusConfigured(isRadiusConfigured());
    
    // Load users
    setUsers(getAllUsers());
    
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = authenticateUser(username, password);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const registerUser = async (username: string, isAdmin = false): Promise<User | null> => {
    try {
      const newUser = createUser(username, isAdmin);
      if (newUser) {
        setUsers([...getAllUsers()]);
        return newUser;
      }
      return null;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        isRadiusConfigured: radiusConfigured,
        login,
        logout,
        registerUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
