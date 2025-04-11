
import { useState, useEffect } from 'react';
import { getAdminSettings, getAllUsers } from '@/services/storageService';

export const useAdminRegistration = () => {
  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState<boolean>(() => {
    const settings = getAdminSettings();
    return settings.allowRegistration;
  });

  const [users, setUsers] = useState<any[]>(() => {
    return getAllUsers();
  });

  // Listen for admin settings changes
  useEffect(() => {
    // Periodically check admin settings
    const checkAdminSettings = () => {
      const settings = getAdminSettings();
      setIsRegistrationAllowed(settings.allowRegistration);
    };

    const interval = setInterval(checkAdminSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  // Periodically refresh users list
  useEffect(() => {
    const refreshUsers = () => {
      setUsers(getAllUsers());
    };
    
    const interval = setInterval(refreshUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    isRegistrationAllowed,
    users
  };
};
