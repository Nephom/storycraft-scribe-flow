
interface RadiusSettings {
  serverUrl: string;
  serverPort: number;
  sharedSecret: string;
  adminUsers: string[];
  isConfigured: boolean; // Add a flag to track configuration status
  setupDate: string;     // Track when the setup was completed
}

// Configuration keys
const LOCAL_RADIUS_SETTINGS_KEY = 'radius-settings';
const LOCAL_RADIUS_USERS_KEY = 'radius-users';
const LOCAL_RADIUS_CONFIG_STATUS = 'radius-config-status';

// Initialize RADIUS service
export const initializeRadiusService = (): void => {
  try {
    console.log("初始化RADIUS服務...");
    // Check if RADIUS settings exist, if not, create default empty settings
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
    
    // Initialize users storage if it doesn't exist
    const users = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    if (!users) {
      localStorage.setItem(LOCAL_RADIUS_USERS_KEY, JSON.stringify([]));
      console.log("初始化用户数据库完成，加载了 0 个用户");
    } else {
      const userCount = JSON.parse(users).length;
      console.log(`初始化用户数据库完成，加载了 ${userCount} 个用户`);
    }
    
    // Create a separate configuration status marker
    if (!localStorage.getItem(LOCAL_RADIUS_CONFIG_STATUS)) {
      localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'false');
    }
  } catch (error) {
    console.error('RADIUS服務初始化錯誤:', error);
  }
};

// Get RADIUS settings
export const getRadiusSettings = (): RadiusSettings | null => {
  try {
    const settings = localStorage.getItem(LOCAL_RADIUS_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('讀取RADIUS設置錯誤:', error);
    return null;
  }
};

// Save RADIUS settings
export const saveRadiusSettings = (settings: RadiusSettings): void => {
  try {
    // Update the isConfigured flag and setup date
    settings.isConfigured = true;
    settings.setupDate = new Date().toISOString();
    
    localStorage.setItem(LOCAL_RADIUS_SETTINGS_KEY, JSON.stringify(settings));
    // Also update the separate configuration status marker
    localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'true');
    console.log("RADIUS設置已保存，配置狀態已更新");
  } catch (error) {
    console.error('保存RADIUS設置錯誤:', error);
  }
};

// In a real app, this would communicate with an actual RADIUS server
// For this demo, we'll simulate it
export const authenticateWithRadius = (username: string, password: string): boolean => {
  try {
    // Get stored users to simulate RADIUS authentication
    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Simulate RADIUS authentication
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

// For demo purposes, add a test user to our simulated RADIUS server
export const addRadiusUser = (username: string, password: string): void => {
  try {
    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if user already exists
    const existingUserIndex = users.findIndex((u: any) => u.username === username);
    
    if (existingUserIndex >= 0) {
      // Update existing user
      users[existingUserIndex] = { username, password };
    } else {
      // Add new user
      users.push({ username, password });
    }
    
    localStorage.setItem(LOCAL_RADIUS_USERS_KEY, JSON.stringify(users));
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

    // Get stored users
    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if user already exists
    const existingUser = users.find((u: any) => u.username === username);
    if (existingUser) {
      console.error('用戶已存在');
      return false;
    }
    
    // Add new user
    users.push({ username, password });
    localStorage.setItem(LOCAL_RADIUS_USERS_KEY, JSON.stringify(users));
    
    // If user should be an admin, update RADIUS settings
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

// Check if RADIUS is configured
export const isRadiusConfigured = (): boolean => {
  try {
    // Check the separate configuration status marker first (more reliable)
    const configStatus = localStorage.getItem(LOCAL_RADIUS_CONFIG_STATUS);
    if (configStatus === 'true') {
      return true;
    }
    
    // Fallback to checking settings object
    const settings = getRadiusSettings();
    if (settings && settings.isConfigured) {
      // Ensure the configuration status marker is synced
      localStorage.setItem(LOCAL_RADIUS_CONFIG_STATUS, 'true');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('檢查RADIUS配置狀態錯誤:', error);
    return false;
  }
};

// Check if user is an admin
export const isRadiusAdmin = (username: string): boolean => {
  const settings = getRadiusSettings();
  return settings?.adminUsers.includes(username) || false;
};

// Get all RADIUS users (for demo purposes)
export const getAllRadiusUsers = () => {
  try {
    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error('獲取RADIUS用戶列表錯誤:', error);
    return [];
  }
};
