
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAdminSettings, updateAdminSettings, getAllUsers } from '@/services/storageService';

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

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    return getAdminSettings();
  });

  // Check if admin setup is complete by verifying if any admin user exists
  const [isAdminSetupComplete, setIsAdminSetupComplete] = useState<boolean>(() => {
    // Check both the localStorage flag and if any admin user exists
    const localStorageFlag = localStorage.getItem('adminSetupComplete') === 'true';
    const adminUserExists = getAllUsers().some(user => user.isAdmin);
    return localStorageFlag || adminUserExists;
  });

  // Monitor settings changes
  useEffect(() => {
    const checkSettings = () => {
      const currentSettings = getAdminSettings();
      setSettings(currentSettings);
      
      // Regularly check if any admin exists
      const adminUserExists = getAllUsers().some(user => user.isAdmin);
      if (adminUserExists && !isAdminSetupComplete) {
        setIsAdminSetupComplete(true);
        localStorage.setItem('adminSetupComplete', 'true');
      }
    };
    
    const interval = setInterval(checkSettings, 5000);
    return () => clearInterval(interval);
  }, [isAdminSetupComplete]);

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    updateAdminSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const completeAdminSetup = () => {
    setIsAdminSetupComplete(true);
    localStorage.setItem('adminSetupComplete', 'true');
  };

  return (
    <AdminContext.Provider value={{ settings, isAdminSetupComplete, updateSettings, completeAdminSetup }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
