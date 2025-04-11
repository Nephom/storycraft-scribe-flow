
import React, { createContext, useContext } from 'react';
import { User } from '@/services/storageService';
import { useUserAuth } from '@/hooks/useUserAuth';
import { useGuestMode } from '@/hooks/useGuestMode';
import { useAdminRegistration } from '@/hooks/useAdminRegistration';

interface AuthContextType {
  user: Omit<User, 'passwordHash'> | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string, isAdmin?: boolean) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  users: Omit<User, 'passwordHash'>[];
  isRegistrationAllowed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the extracted hooks
  const { user, login, register: baseRegister, logout, isAuthenticated } = useUserAuth();
  const { isGuest, continueAsGuest, exitGuestMode } = useGuestMode();
  const { isRegistrationAllowed, users } = useAdminRegistration();

  // Wrap the register function to handle guest mode and registration permissions
  const register = (username: string, password: string, isAdmin = false): boolean => {
    // Check if registration is allowed (unless creating an admin account with no users)
    if (!isAdmin && !isRegistrationAllowed) {
      return false;
    }

    const success = baseRegister(username, password, isAdmin);
    
    if (success) {
      // Exit guest mode when registering
      exitGuestMode();
      return true;
    }
    
    return false;
  };

  // Wrap the login function to handle guest mode
  const enhancedLogin = (username: string, password: string): boolean => {
    const success = login(username, password);
    if (success) {
      exitGuestMode();
    }
    return success;
  };

  // Wrap the logout function to ensure guest mode is also cleared
  const enhancedLogout = () => {
    logout();
    exitGuestMode();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login: enhancedLogin, 
      register,
      logout: enhancedLogout, 
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
