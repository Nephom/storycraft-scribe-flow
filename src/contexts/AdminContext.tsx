
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

  // 檢查是否已經存在管理員帳號
  const [isAdminSetupComplete, setIsAdminSetupComplete] = useState<boolean>(() => {
    // 只檢查是否存在管理員使用者，不再依賴localStorage
    const adminUserExists = getAllUsers().some(user => user.isAdmin);
    return adminUserExists;
  });

  // 監控設置變化
  useEffect(() => {
    const checkSettings = () => {
      const currentSettings = getAdminSettings();
      setSettings(currentSettings);
      
      // 定期檢查是否存在管理員帳號
      const adminUserExists = getAllUsers().some(user => user.isAdmin);
      if (adminUserExists && !isAdminSetupComplete) {
        setIsAdminSetupComplete(true);
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
