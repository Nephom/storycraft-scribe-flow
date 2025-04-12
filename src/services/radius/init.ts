
import { RadiusSettings } from './types';
import { saveRadiusSettings, getRadiusSettings, LOCAL_RADIUS_CONFIG_STATUS, GLOBAL_RADIUS_CONFIG_KEY } from './storage';
import { checkGlobalRadiusStatus, setGlobalRadiusConfigured, addConfigAdmin } from './config';

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
      } else {
        // Sync admin users with config
        settings.adminUsers.forEach(admin => {
          addConfigAdmin(admin);
        });
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
    } else {
      // Sync admin users with config
      settings.adminUsers.forEach(admin => {
        addConfigAdmin(admin);
      });
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
