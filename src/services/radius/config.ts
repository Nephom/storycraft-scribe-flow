
import { getRadiusSettings } from './storage';
import { LOCAL_RADIUS_CONFIG_STATUS, GLOBAL_RADIUS_CONFIG_KEY } from './storage';

// Global configuration flag
let globalRadiusConfigured = false;

// Check if RADIUS is configured
export const isRadiusConfigured = (): boolean => {
  try {
    if (globalRadiusConfigured) {
      return true;
    }
    
    const configStatus = localStorage.getItem(LOCAL_RADIUS_CONFIG_STATUS);
    if (configStatus === 'true') {
      globalRadiusConfigured = true;
      return true;
    }
    
    const settings = getRadiusSettings();
    if (settings && settings.isConfigured) {
      localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'true');
      globalRadiusConfigured = true;
      localStorage.setItem(GLOBAL_RADIUS_CONFIG_KEY, 'true');
      return true;
    }
    
    const globalConfigured = localStorage.getItem(GLOBAL_RADIUS_CONFIG_KEY);
    if (globalConfigured === 'true') {
      globalRadiusConfigured = true;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('檢查RADIUS配置狀態錯誤:', error);
    return false;
  }
};

// Check for global configuration status
export const checkGlobalRadiusStatus = async (): Promise<boolean> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const status = localStorage.getItem(GLOBAL_RADIUS_CONFIG_KEY);
    
    if (status === 'true') {
      globalRadiusConfigured = true;
      console.log("服务器报告全局RADIUS已配置");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('检查全局RADIUS状态出错:', error);
    return false;
  }
};

// Check if a user is a RADIUS admin
export const isRadiusAdmin = (username: string): boolean => {
  const settings = getRadiusSettings();
  return settings?.adminUsers.includes(username) || false;
};

// Set global configuration status
export const setGlobalRadiusConfigured = (value: boolean): void => {
  globalRadiusConfigured = value;
};
