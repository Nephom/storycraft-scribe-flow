
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '@/types';
import { verifyUser, getUser } from '@/services/dbService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  isAdmin: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (username: string, password: string): Promise<boolean> => {
    const user = verifyUser(username, password);
    if (user) {
      localStorage.setItem('userId', user.id);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setCurrentUser(null);
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const user = getUser(userId);
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAdmin: currentUser?.isAdmin || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
