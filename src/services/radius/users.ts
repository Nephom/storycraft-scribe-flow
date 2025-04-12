
import { getRadiusUsers, saveRadiusUsers } from './storage';
import { getRadiusSettings, saveRadiusSettings } from './storage';
import { RadiusUser } from './types';

// User authentication
export const authenticateWithRadius = (username: string, password: string): boolean => {
  try {
    const users = getRadiusUsers();
    
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
    const users = getRadiusUsers();
    
    const existingUserIndex = users.findIndex((u) => u.username === username);
    
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = { username, password };
    } else {
      users.push({ username, password });
    }
    
    saveRadiusUsers(users);
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

    const users = getRadiusUsers();
    
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      console.error('用戶已存在');
      return false;
    }
    
    users.push({ username, password });
    saveRadiusUsers(users);
    
    if (isAdmin) {
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
  return getRadiusUsers();
};
