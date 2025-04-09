
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAdminSettings, updateAdminSettings } from '@/services/storageService';

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

  const [isAdminSetupComplete, setIsAdminSetupComplete] = useState<boolean>(() => {
    return localStorage.getItem('adminSetupComplete') === 'true';
  });

  // 监听设置变化
  useEffect(() => {
    const checkSettings = () => {
      const currentSettings = getAdminSettings();
      setSettings(currentSettings);
    };
    
    const interval = setInterval(checkSettings, 5000);
    return () => clearInterval(interval);
  }, []);

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
