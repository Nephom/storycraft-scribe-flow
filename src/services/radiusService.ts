
interface RadiusSettings {
  serverUrl: string;
  serverPort: number;
  sharedSecret: string;
  adminUsers: string[];
}

// Simulated RADIUS settings stored in localStorage
const LOCAL_RADIUS_SETTINGS_KEY = 'radius-settings';
const LOCAL_RADIUS_USERS_KEY = 'radius-users';

// Get RADIUS settings
export const getRadiusSettings = (): RadiusSettings | null => {
  try {
    const settings = localStorage.getItem(LOCAL_RADIUS_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error loading RADIUS settings:', error);
    return null;
  }
};

// Save RADIUS settings
export const saveRadiusSettings = (settings: RadiusSettings): void => {
  try {
    localStorage.setItem(LOCAL_RADIUS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving RADIUS settings:', error);
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
    console.error('Error during RADIUS authentication:', error);
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
    console.error('Error adding RADIUS user:', error);
  }
};

// Add the missing registerRadiusUser function
export const registerRadiusUser = (username: string, password: string, isAdmin: boolean = false): boolean => {
  try {
    if (!username || !password) {
      console.error('Username and password are required');
      return false;
    }

    // Get stored users
    const storedUsers = localStorage.getItem(LOCAL_RADIUS_USERS_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if user already exists
    const existingUser = users.find((u: any) => u.username === username);
    if (existingUser) {
      console.error('User already exists');
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
    console.error('Error registering RADIUS user:', error);
    return false;
  }
};

// Check if RADIUS is configured
export const isRadiusConfigured = (): boolean => {
  const settings = getRadiusSettings();
  return settings !== null;
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
    console.error('Error getting RADIUS users:', error);
    return [];
  }
};
