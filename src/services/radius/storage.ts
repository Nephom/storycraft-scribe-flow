
import { RadiusSettings, RadiusUser } from './types';

// Storage keys
export const LOCAL_RADIUS_SETTINGS_KEY = 'radius-settings';
export const LOCAL_RADIUS_USERS_KEY = 'radius-users';
export const LOCAL_RADIUS_CONFIG_STATUS = 'radius-config-status';
export const GLOBAL_RADIUS_CONFIG_KEY = 'global-radius-configured';

// Get radius settings from storage
export const getRadiusSettings = (): RadiusSettings | null => {
  try {
    const settings = localStorage.getItem(LOCAL_RADIUS_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('讀取RADIUS設置錯誤:', error);
    return null;
  }
};

// Save radius settings to storage
export const saveRadiusSettings = (settings: RadiusSettings): void => {
  try {
    settings.isConfigured = true;
    settings.setupDate = new Date().toISOString();
    
    localStorage.setItem(LOCAL_RADIUS_SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'true');
    localStorage.setItem(GLOBAL_RADIUS_CONFIG_KEY, 'true');
    console.log("RADIUS設置已保存，全局配置狀態已更新");
  } catch (error) {
    console.error('保存RADIUS設置錯誤:', error);
  }
};

// Get all users from storage
export const getRadiusUsers = (): RadiusUser[] => {
  try {
    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error('獲取RADIUS用戶列表錯誤:', error);
    return [];
  }
};

// Save users to storage
export const saveRadiusUsers = (users: RadiusUser[]): void => {
  try {
    localStorage.setItem(LOCAL_RADIUS_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('保存RADIUS用戶錯誤:', error);
  }
};

// Clear radius configuration
export const clearRadiusConfiguration = (): void => {
  try {
    localStorage.removeItem(LOCAL_RADIUS_SETTINGS_KEY);
    localStorage.removeItem(LOCAL_RADIUS_CONFIG_STATUS);
    localStorage.removeItem(GLOBAL_RADIUS_CONFIG_KEY);
    console.log("RADIUS配置已清除");
  } catch (error) {
    console.error('清除RADIUS配置錯誤:', error);
  }
};
