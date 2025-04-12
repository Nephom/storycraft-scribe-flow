
import React, { createContext, useState, useContext, useEffect } from 'react';
import { isRadiusConfigured } from '@/services/radiusService';

interface AdminContextType {
  isAdminSetupComplete: boolean;
  completeAdminSetup: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use RADIUS config status to determine if admin setup is complete
  const [isAdminSetupComplete, setIsAdminSetupComplete] = useState<boolean>(() => {
    return isRadiusConfigured();
  });

  // Check for RADIUS config periodically
  useEffect(() => {
    const checkSettings = () => {
      const radiusConfigured = isRadiusConfigured();
      if (radiusConfigured && !isAdminSetupComplete) {
        setIsAdminSetupComplete(true);
      }
    };
    
    const interval = setInterval(checkSettings, 5000);
    return () => clearInterval(interval);
  }, [isAdminSetupComplete]);

  const completeAdminSetup = () => {
    setIsAdminSetupComplete(true);
  };

  return (
    <AdminContext.Provider value={{ isAdminSetupComplete, completeAdminSetup }}>
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
