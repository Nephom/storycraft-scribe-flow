
import { v4 as uuidv4 } from 'uuid';
import { syncDatabaseToStorage } from './storageUtils';

const LOCAL_USERS_KEY = 'users';

// User type definition
export type User = {
  id: string;
  username: string;
  passwordHash: string;
  isAdmin?: boolean;
};

// In-memory user database
let inMemoryUserDB: User[] = [];

// Load users from storage
export const loadUsers = (): User[] => {
  try {
    const storedUsers = localStorage.getItem(LOCAL_USERS_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    return [];
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
    return [];
  }
};

// Initialize the user database
export const initUserDatabase = (): void => {
  try {
    inMemoryUserDB = loadUsers();
    console.log('初始化用户数据库完成，加载了', inMemoryUserDB.length, '个用户');
  } catch (error) {
    console.error('初始化用户数据库错误:', error);
  }
};

// Save users to storage
export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

// Password utility functions
const hashPassword = (password: string): string => {
  // Simple hash for demonstration purposes
  return `hashed_${password}_${Date.now()}`;
};

const verifyPassword = (plainPassword: string, hashedPassword: string): boolean => {
  return hashedPassword.startsWith(`hashed_${plainPassword}_`);
};

// User management functions
export const getAllUsers = (): User[] => {
  // Ensure we have the latest data
  inMemoryUserDB = loadUsers();
  return [...inMemoryUserDB].map(user => ({
    ...user,
    passwordHash: '****' // Don't return actual hash
  }));
};

export const createUser = (username: string, password: string, isAdmin: boolean = false): User | null => {
  // Ensure we have the latest data
  inMemoryUserDB = loadUsers();
  
  // Check if username already exists
  if (inMemoryUserDB.some(user => user.username === username)) {
    return null;
  }

  const newUser: User = {
    id: uuidv4(),
    username,
    passwordHash: hashPassword(password),
    isAdmin
  };

  inMemoryUserDB.push(newUser);
  saveUsers(inMemoryUserDB);
  syncDatabaseToStorage();

  // Return user without password hash
  return {
    ...newUser,
    passwordHash: '****'
  };
};

export const authenticateUser = (username: string, password: string): User | null => {
  // Ensure we have the latest data
  inMemoryUserDB = loadUsers();
  
  const user = inMemoryUserDB.find(user => user.username === username);
  
  if (user && verifyPassword(password, user.passwordHash)) {
    // Return user without password hash
    return {
      ...user,
      passwordHash: '****'
    };
  }

  return null;
};

export const deleteUser = (userId: string): boolean => {
  // Ensure we have the latest data
  inMemoryUserDB = loadUsers();
  
  const initialLength = inMemoryUserDB.length;
  inMemoryUserDB = inMemoryUserDB.filter(user => user.id !== userId);
  
  if (inMemoryUserDB.length !== initialLength) {
    saveUsers(inMemoryUserDB);
    syncDatabaseToStorage();
    return true;
  }
  
  return false;
};

// Initialize the database
initUserDatabase();
