
import { RadiusSettings } from './types';
import { saveRadiusSettings, getRadiusSettings, LOCAL_RADIUS_USERS_KEY, LOCAL_RADIUS_CONFIG_STATUS, LOCAL_RADIUS_SETTINGS_KEY } from './storage';
import { checkGlobalRadiusStatus, setGlobalRadiusConfigured } from './config';

// Initialize RADIUS service
export const initializeRadiusService = async (): Promise<void> => {
  try {
    console.log("初始化RADIUS服務...");
    
    // Check global configuration status first
    const isGloballyConfigured = await checkGlobalRadiusStatus();
    if (isGloballyConfigured) {
      console.log("检测到全局RADIUS配置已完成");
      localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'true');
      setGlobalRadiusConfigured(true);
      
      const settings = getRadiusSettings();
      if (!settings) {
        const defaultSettings: RadiusSettings = {
          serverUrl: 'localhost',
          serverPort: 1812,
          sharedSecret: 'default-shared-secret',
          adminUsers: [],
          isConfigured: true,
          setupDate: new Date().toISOString()
        };
        saveRadiusSettings(defaultSettings);
      }
      return;
    }
    
    // Check local configuration status
    const configStatus = localStorage.getItem(LOCAL_RADIUS_CONFIG_STATUS);
    if (configStatus === 'true') {
      setGlobalRadiusConfigured(true);
      console.log("本地RADIUS配置已完成，设置全局标志");
    }
    
    // Initialize settings if needed
    const settings = getRadiusSettings();
    if (!settings) {
      const defaultSettings: RadiusSettings = {
        serverUrl: '',
        serverPort: 1812,
        sharedSecret: '',
        adminUsers: [],
        isConfigured: false,
        setupDate: ''
      };
      saveRadiusSettings(defaultSettings);
      console.log("創建默認RADIUS設置");
    }
    
    // Initialize users if needed
    const users = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    if (!users) {
      localStorage.setItem(LOCAL_RADIUS_USERS_KEY, JSON.stringify([]));
      console.log("初始化用户数据库完成，加载了 0 个用户");
    } else {
      const userCount = JSON.parse(users).length;
      console.log(`初始化用户数据库完成，加载了 ${userCount} 个用户`);
    }
    
    // Set default config status if not present
    if (!localStorage.getItem(LOCAL_RADIUS_CONFIG_STATUS)) {
      localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'false');
    }
    
    // Check global status after initialization
    await checkGlobalRadiusStatus();
  } catch (error) {
    console.error('RADIUS服務初始化錯誤:', error);
  }
};
