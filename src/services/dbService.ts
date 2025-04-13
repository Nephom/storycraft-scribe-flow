import { v4 as uuidv4 } from 'uuid';
import { User, AppSettings } from '@/types';
import bcrypt from 'bcryptjs';

// Local storage keys
const USERS_KEY = 'novel-writer-users';
const SETTINGS_KEY = 'novel-writer-settings';

// Initialize local storage with default settings if needed
const initializeLocalStorage = () => {
  // Initialize users if not exists
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }

  // Initialize settings if not exists
  if (!localStorage.getItem(SETTINGS_KEY)) {
    const defaultSettings = {
      allowRegistration: true,
      setupCompleted: false
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
};

// Call initialization
initializeLocalStorage();

// User functions
export const createUser = (username: string, password: string, isAdmin: boolean = false): User => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  
  // Check if username exists
  if (users.some(user => user.username === username)) {
    throw new Error('Username already exists');
  }
  
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = uuidv4();
  const now = Date.now();
  
  const newUser: User = {
    id: userId,
    username,
    passwordHash,
    isAdmin,
    createdAt: now,
    novels: []
  };
  
  // Add user to storage
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  return newUser;
};

export const verifyUser = (username: string, password: string): User | null => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const user = users.find(user => user.username === username);
  
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return null;
  }
  
  return user;
};

export const getUser = (userId: string): User | null => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  return users.find(user => user.id === userId) || null;
};

export const getAllUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
};

// Settings functions
export const getSettings = (): AppSettings => {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as AppSettings;
};

export const updateSettings = (settings: Partial<AppSettings>): AppSettings => {
  const currentSettings = getSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  
  return updatedSettings;
};

export const isSetupCompleted = (): boolean => {
  const settings = getSettings();
  return settings.setupCompleted;
};

// We don't need to export a database instance anymore since we're using localStorage
// but we'll keep a dummy export to maintain compatibility with the rest of the code
const dummyDb = {
  prepare: () => ({
    get: () => null,
    all: () => [],
    run: () => {}
  }),
  exec: () => {}
};

export default dummyDb;
