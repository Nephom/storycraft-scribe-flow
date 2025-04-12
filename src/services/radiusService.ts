interface RadiusSettings {
  serverUrl: string;
  serverPort: number;
  sharedSecret: string;
  adminUsers: string[];
  isConfigured: boolean;
  setupDate: string;
}

const LOCAL_RADIUS_SETTINGS_KEY = 'radius-settings';
const LOCAL_RADIUS_USERS_KEY = 'radius-users';
const LOCAL_RADIUS_CONFIG_STATUS = 'radius-config-status';

let globalRadiusConfigured = false;

export const initializeRadiusService = async (): Promise<void> => {
  try {
    console.log("初始化RADIUS服務...");
    
    if (globalRadiusConfigured) {
      console.log("检测到全局RADIUS配置已完成");
      localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'true');
      const settings = localStorage.getItem(LOCAL_RADIUS_SETTINGS_KEY);
      if (!settings) {
        const defaultSettings: RadiusSettings = {
          serverUrl: 'localhost',
          serverPort: 1812,
          sharedSecret: 'default-shared-secret',
          adminUsers: [],
          isConfigured: true,
          setupDate: new Date().toISOString()
        };
        localStorage.setItem(LOCAL_RADIUS_SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
      return;
    }
    
    const configStatus = localStorage.getItem(LOCAL_RADIUS_CONFIG_STATUS);
    if (configStatus === 'true') {
      globalRadiusConfigured = true;
      console.log("本地RADIUS配置已完成，设置全局标志");
    }
    
    const settings = localStorage.getItem(LOCAL_RADIUS_SETTINGS_KEY);
    if (!settings) {
      const defaultSettings: RadiusSettings = {
        serverUrl: '',
        serverPort: 1812,
        sharedSecret: '',
        adminUsers: [],
        isConfigured: false,
        setupDate: ''
      };
      localStorage.setItem(LOCAL_RADIUS_SETTINGS_KEY, JSON.stringify(defaultSettings));
      console.log("創建默認RADIUS設置");
    }
    
    const users = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    if (!users) {
      localStorage.setItem(LOCAL_RADIUS_USERS_KEY, JSON.stringify([]));
      console.log("初始化用户数据库完成，加载了 0 个用户");
    } else {
      const userCount = JSON.parse(users).length;
      console.log(`初始化用户数据库完成，加载了 ${userCount} 个用户`);
    }
    
    if (!localStorage.getItem(LOCAL_RADIUS_CONFIG_STATUS)) {
      localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'false');
    }
    
    await checkGlobalRadiusStatus();
  } catch (error) {
    console.error('RADIUS服務初始化錯誤:', error);
  }
};

const checkGlobalRadiusStatus = async (): Promise<boolean> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const status = localStorage.getItem('global-radius-configured');
    
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

export const getRadiusSettings = (): RadiusSettings | null => {
  try {
    const settings = localStorage.getItem(LOCAL_RADIUS_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('讀取RADIUS設置錯誤:', error);
    return null;
  }
};

export const saveRadiusSettings = (settings: RadiusSettings): void => {
  try {
    settings.isConfigured = true;
    settings.setupDate = new Date().toISOString();
    
    localStorage.setItem(LOCAL_RADIUS_SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'true');
    globalRadiusConfigured = true;
    localStorage.setItem('global-radius-configured', 'true');
    console.log("RADIUS設置已保存，全局配置狀態已更新");
  } catch (error) {
    console.error('保存RADIUS設置錯誤:', error);
  }
};

export const authenticateWithRadius = (username: string, password: string): boolean => {
  try {
    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    const user = users.find((u: any) => u.username === username);
    if (user && user.password === password) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('RADIUS認證過程中發生錯誤:', error);
    return false;
  }
};

export const addRadiusUser = (username: string, password: string): void => {
  try {
    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    const existingUserIndex = users.findIndex((u: any) => u.username === username);
    
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = { username, password };
    } else {
      users.push({ username, password });
    }
    
    localStorage.setItem(LOCAL_RADIUS_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('添加RADIUS用戶錯誤:', error);
  }
};

export const registerRadiusUser = (username: string, password: string, isAdmin: boolean = false): boolean => {
  try {
    if (!username || !password) {
      console.error('用戶名和密碼是必填項');
      return false;
    }

    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    const existingUser = users.find((u: any) => u.username === username);
    if (existingUser) {
      console.error('用戶已存在');
      return false;
    }
    
    users.push({ username, password });
    localStorage.setItem(LOCAL_RADIUS_USERS_KEY, JSON.stringify(users));
    
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

export const clearRadiusConfiguration = (): void => {
  try {
    localStorage.removeItem(LOCAL_RADIUS_SETTINGS_KEY);
    localStorage.removeItem(LOCAL_RADIUS_CONFIG_STATUS);
    localStorage.removeItem('global-radius-configured');
    globalRadiusConfigured = false;
    console.log("RADIUS配置已清除");
  } catch (error) {
    console.error('清除RADIUS配置錯誤:', error);
  }
};

export const isRadiusConfigured = (): boolean => {
  try {
    if (globalRadiusConfigured) {
      return true;
    }
    
    const configStatus = localStorage.getItem(LOCAL_RADIUS_CONFIG_STATUS);
    if (configStatus === 'true') {
      return true;
    }
    
    const settings = getRadiusSettings();
    if (settings && settings.isConfigured) {
      localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'true');
      globalRadiusConfigured = true;
      localStorage.setItem('global-radius-configured', 'true');
      return true;
    }
    
    const globalConfigured = localStorage.getItem('global-radius-configured');
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

export const isRadiusAdmin = (username: string): boolean => {
  const settings = getRadiusSettings();
  return settings?.adminUsers.includes(username) || false;
};

export const getAllRadiusUsers = () => {
  try {
    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error('獲取RADIUS用戶列表錯誤:', error);
    return [];
  }
};
