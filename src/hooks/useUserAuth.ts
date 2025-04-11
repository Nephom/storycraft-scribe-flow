
import { useState } from 'react';
import { User, authenticateUser, createUser } from '@/services/storageService';

export const useUserAuth = () => {
  // Check local storage for logged in user on initialization
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username: string, password: string): boolean => {
    // Use database service to validate user
    const authenticatedUser = authenticateUser(username, password);
    
    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      return true;
    }
    
    return false;
  };

  const register = (username: string, password: string, isAdmin = false): boolean => {
    // Basic validation
    if (username.length < 3 || password.length < 6) {
      return false;
    }

    // Use database service to create user
    const newUser = createUser(username, password, isAdmin);
    
    if (newUser) {
      // Auto-login new user
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};
