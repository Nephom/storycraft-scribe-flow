
import React, { createContext, useState, useContext, useEffect } from 'react';

interface AdminSettings {
  allowRegistration: boolean;
}

interface AdminContextType {
  settings: AdminSettings;
  isAdminSetupComplete: boolean;
  updateSettings: (settings: Partial<AdminSettings>) => void;
  completeAdminSetup: () => void;
}

const defaultSettings: AdminSettings = {
  allowRegistration: true,
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [isAdminSetupComplete, setIsAdminSetupComplete] = useState<boolean>(() => {
    return localStorage.getItem('adminSetupComplete') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
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
