
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAdminSettings, updateAdminSettings, getAllUsers } from '@/services/storageService';

// Types
interface AdminSettings {
  allowRegistration: boolean;
  dashboardUrl: string;
}

interface AdminContextType {
  settings: AdminSettings;
  isAdminSetupComplete: boolean;
  updateSettings: (settings: Partial<AdminSettings>) => void;
  completeAdminSetup: () => void;
}

// Create context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Custom hook for checking admin status
const useAdminStatus = () => {
  const [isAdminSetupComplete, setIsAdminSetupComplete] = useState<boolean>(() => {
    // Only check if admin user exists, no longer dependent on localStorage
    const adminUserExists = getAllUsers().some(user => user.isAdmin);
    return adminUserExists;
  });

  return { isAdminSetupComplete, setIsAdminSetupComplete };
};

// Custom hook for admin settings
const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    return getAdminSettings();
  });

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    updateAdminSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  return { settings, setSettings, updateSettings };
};

// Provider component
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdminSetupComplete, setIsAdminSetupComplete } = useAdminStatus();
  const { settings, setSettings, updateSettings } = useAdminSettings();

  // Monitor for changes
  useEffect(() => {
    const checkAdminState = () => {
      // Check settings
      const currentSettings = getAdminSettings();
      setSettings(currentSettings);
      
      // Check admin account existence
      const adminUserExists = getAllUsers().some(user => user.isAdmin);
      if (adminUserExists && !isAdminSetupComplete) {
        setIsAdminSetupComplete(true);
      }
    };
    
    const interval = setInterval(checkAdminState, 5000);
    return () => clearInterval(interval);
  }, [isAdminSetupComplete, setIsAdminSetupComplete, setSettings]);

  const completeAdminSetup = () => {
    setIsAdminSetupComplete(true);
  };

  const contextValue = {
    settings,
    isAdminSetupComplete,
    updateSettings,
    completeAdminSetup
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook for consuming context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
