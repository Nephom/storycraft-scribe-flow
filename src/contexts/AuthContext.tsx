
import React, { createContext, useState, useContext, useEffect } from 'react';

type User = {
  username: string;
  id: string;
};

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
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

  const isAuthenticated = !!user;

  // Mock login function - in a real app this would call an API
  const login = (username: string, password: string): boolean => {
    // Very simple validation - in a real app this would verify against a database
    if (username.length >= 3 && password.length >= 6) {
      const user = { username, id: Date.now().toString() };
      setUser(user);
      setIsGuest(false);
      localStorage.setItem('user', JSON.stringify(user));
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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isGuest, continueAsGuest }}>
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
