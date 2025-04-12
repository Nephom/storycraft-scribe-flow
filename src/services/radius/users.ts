import { getRadiusSettings, saveRadiusSettings } from './storage';
import { getConfigUsers, addConfigUser, isRadiusAdmin, addConfigAdmin, getAllConfigUsers } from './config';
import { RadiusUser } from './types';

// User authentication
export const authenticateWithRadius = (username: string, password: string): boolean => {
  try {
    const users = getConfigUsers();
    
    const user = users.find((u) => u.username === username);
    if (user && user.password === password) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('RADIUS認證過程中發生錯誤:', error);
    return false;
  }
};

// Add a user to RADIUS
export const addRadiusUser = (username: string, password: string): void => {
  try {
    addConfigUser(username, password);
  } catch (error) {
    console.error('添加RADIUS用戶錯誤:', error);
  }
};

// Register a new RADIUS user
export const registerRadiusUser = (username: string, password: string, isAdmin: boolean = false): boolean => {
  try {
    if (!username || !password) {
      console.error('用戶名和密碼是必填項');
      return false;
    }

    const users = getConfigUsers();
    
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      console.error('用戶已存在');
      return false;
    }
    
    addConfigUser(username, password);
    
    if (isAdmin) {
      addConfigAdmin(username);
      
      // Keep settings synchronized
      const settings = getRadiusSettings();
      if (settings) {
        if (!settings.adminUsers.includes(username)) {
          settings.adminUsers.push(username);
          saveRadiusSettings(settings);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('註冊RADIUS用戶錯誤:', error);
    return false;
  }
};

// Get all RADIUS users
export const getAllRadiusUsers = (): RadiusUser[] => {
  return getAllConfigUsers();
};
