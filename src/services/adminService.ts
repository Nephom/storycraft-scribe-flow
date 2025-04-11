
import { syncDatabaseToStorage } from './storageUtils';

const LOCAL_ADMIN_SETTINGS_KEY = 'adminSettings';

// Admin settings type definition
export interface AdminSettings {
  allowRegistration: boolean;
  dashboardUrl: string;
}

// Default admin settings
const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  allowRegistration: true,
  dashboardUrl: '/admin'
};

// In-memory admin settings
let inMemoryAdminSettings: AdminSettings = { ...DEFAULT_ADMIN_SETTINGS };

// Load admin settings from storage
export const loadAdminSettings = (): AdminSettings => {
  try {
    const storedSettings = localStorage.getItem(LOCAL_ADMIN_SETTINGS_KEY);
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    return { ...DEFAULT_ADMIN_SETTINGS };
  } catch (error) {
    console.error('Error loading admin settings from localStorage:', error);
    return { ...DEFAULT_ADMIN_SETTINGS };
  }
};

// Save admin settings to storage
export const saveAdminSettings = (settings: AdminSettings): void => {
  try {
    localStorage.setItem(LOCAL_ADMIN_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving admin settings to localStorage:', error);
  }
};

// Initialize admin settings
export const initAdminSettings = (): void => {
  inMemoryAdminSettings = loadAdminSettings();
};

// Update admin settings
export const updateAdminSettings = (settings: Partial<AdminSettings>): void => {
  inMemoryAdminSettings = { ...inMemoryAdminSettings, ...settings };
  saveAdminSettings(inMemoryAdminSettings);
  syncDatabaseToStorage();
};

// Get admin settings
export const getAdminSettings = (): AdminSettings => {
  inMemoryAdminSettings = loadAdminSettings();
  return { ...inMemoryAdminSettings };
};

// Initialize the admin settings
initAdminSettings();
