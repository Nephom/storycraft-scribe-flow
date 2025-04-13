
import { v4 as uuidv4 } from 'uuid';
import type { User, AppSettings, RadiusSettings } from '../types';

// In-memory storage for users and settings
let users: User[] = [];
let appSettings: AppSettings = {
  allowRegistration: true,
  radiusConfigured: false
};
let radiusSettings: RadiusSettings = {
  server: '',
  port: 1812,
  secret: '',
  enabled: false
};

// Initialize with some default data if needed
export const initializeAuth = () => {
  console.log('Initializing auth service...');
  
  // Create admin user if doesn't exist
  if (users.length === 0) {
    users.push({
      id: uuidv4(),
      username: 'admin',
      isAdmin: true,
      novels: []
    });
  }
  
  // Load settings from localStorage if available
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    appSettings = JSON.parse(savedSettings);
  }
  
  const savedRadius = localStorage.getItem('radiusSettings');
  if (savedRadius) {
    radiusSettings = JSON.parse(savedRadius);
  }
};

// RADIUS configuration
export const configureRadius = (settings: RadiusSettings): boolean => {
  try {
    // In a real app, this would test the connection to the RADIUS server
    // For demo purposes, we'll just save the settings
    radiusSettings = settings;
    appSettings.radiusConfigured = true;
    
    // Save settings to localStorage for persistence
    localStorage.setItem('radiusSettings', JSON.stringify(radiusSettings));
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    
    console.log('RADIUS settings saved, global config status updated');
    return true;
  } catch (error) {
    console.error('Failed to configure RADIUS:', error);
    return false;
  }
};

// Check if RADIUS is configured
export const isRadiusConfigured = (): boolean => {
  return appSettings.radiusConfigured;
};

// Authentication
export const authenticateUser = (username: string, password: string): User | null => {
  // In a real app, this would authenticate against the RADIUS server
  // For demo purposes, we'll just check the in-memory users
  const user = users.find(u => u.username === username);
  
  // Simple password check for demo (in a real app, this would be RADIUS auth)
  if (user && password === 'password') {
    return user;
  }
  
  return null;
};

// User management
export const getAllUsers = (): User[] => {
  return [...users];
};

export const createUser = (username: string, isAdmin: boolean = false): User | null => {
  // Check if registration is allowed
  if (!isAdmin && !appSettings.allowRegistration) {
    return null;
  }
  
  // Check if username already exists
  if (users.some(u => u.username === username)) {
    return null;
  }
  
  const newUser: User = {
    id: uuidv4(),
    username,
    isAdmin,
    novels: []
  };
  
  users.push(newUser);
  return newUser;
};

export const updateAllowRegistration = (allow: boolean): void => {
  appSettings.allowRegistration = allow;
  localStorage.setItem('appSettings', JSON.stringify(appSettings));
};

export const getAllowRegistration = (): boolean => {
  return appSettings.allowRegistration;
};

// Reset for testing
export const resetAuthService = () => {
  users = [];
  appSettings = {
    allowRegistration: true,
    radiusConfigured: false
  };
  radiusSettings = {
    server: '',
    port: 1812,
    secret: '',
    enabled: false
  };
  localStorage.removeItem('appSettings');
  localStorage.removeItem('radiusSettings');
  initializeAuth();
};
