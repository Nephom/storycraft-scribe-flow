
import { v4 as uuidv4 } from 'uuid';
import { User, AppSettings } from '@/types';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

// 创建数据库连接
const db = new Database('./novel-writer.db');

// 初始化数据库
const initializeDatabase = () => {
  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      passwordHash TEXT,
      isAdmin INTEGER,
      createdAt INTEGER,
      novels TEXT
    )
  `);

  // 创建设置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // 检查设置是否存在，不存在则初始化
  const settingsStmt = db.prepare('SELECT * FROM settings WHERE key = ?');
  const allowRegistrationSetting = settingsStmt.get('allowRegistration');
  const setupCompletedSetting = settingsStmt.get('setupCompleted');
  const adminCreatedSetting = settingsStmt.get('adminCreated');

  if (!allowRegistrationSetting) {
    const insertStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertStmt.run('allowRegistration', 'true');
  }

  if (!setupCompletedSetting) {
    const insertStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertStmt.run('setupCompleted', 'false');
  }

  if (!adminCreatedSetting) {
    const insertStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertStmt.run('adminCreated', 'false');
  }
};

// 初始化数据库
try {
  initializeDatabase();
  console.log('数据库初始化成功');
} catch (error) {
  console.error('数据库初始化失败:', error);
}

// 全局状态函数
export const isAdminCreated = (): boolean => {
  try {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get('adminCreated');
    return result ? result.value === 'true' : false;
  } catch (error) {
    console.error('检查管理员状态失败:', error);
    return false;
  }
};

// 用户函数
export const createUser = (username: string, password: string, isAdmin: boolean = false): User => {
  try {
    // 检查用户名是否存在
    const checkStmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const existingUser = checkStmt.get(username);
    
    if (existingUser) {
      throw new Error('用户名已存在');
    }
    
    // 检查是否尝试创建管理员且已存在管理员
    if (isAdmin && isAdminCreated()) {
      throw new Error('管理员已存在');
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
    
    // 将用户添加到数据库
    const insertStmt = db.prepare('INSERT INTO users (id, username, passwordHash, isAdmin, createdAt, novels) VALUES (?, ?, ?, ?, ?, ?)');
    insertStmt.run(
      userId,
      username,
      passwordHash,
      isAdmin ? 1 : 0,
      now,
      JSON.stringify([])
    );
    
    // 如果创建的是管理员，更新全局状态
    if (isAdmin) {
      const updateStmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
      updateStmt.run('true', 'adminCreated');
      
      // 同时标记设置为已完成
      updateStmt.run('true', 'setupCompleted');
    }
    
    return newUser;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
};

export const verifyUser = (username: string, password: string): User | null => {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);
    
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return null;
    }
    
    return {
      ...user,
      isAdmin: Boolean(user.isAdmin),
      novels: JSON.parse(user.novels || '[]')
    };
  } catch (error) {
    console.error('验证用户失败:', error);
    return null;
  }
};

export const getUser = (userId: string): User | null => {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(userId);
    
    if (!user) {
      return null;
    }
    
    return {
      ...user,
      isAdmin: Boolean(user.isAdmin),
      novels: JSON.parse(user.novels || '[]')
    };
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
};

export const getAllUsers = (): User[] => {
  try {
    const stmt = db.prepare('SELECT * FROM users');
    const users = stmt.all();
    
    return users.map(user => ({
      ...user,
      isAdmin: Boolean(user.isAdmin),
      novels: JSON.parse(user.novels || '[]')
    }));
  } catch (error) {
    console.error('获取所有用户失败:', error);
    return [];
  }
};

// 设置函数
export const getSettings = (): AppSettings => {
  try {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const settingsRows = stmt.all();
    
    const settings: Record<string, any> = {};
    for (const row of settingsRows) {
      if (row.value === 'true' || row.value === 'false') {
        settings[row.key] = row.value === 'true';
      } else {
        settings[row.key] = row.value;
      }
    }
    
    return settings as AppSettings;
  } catch (error) {
    console.error('获取设置失败:', error);
    return { allowRegistration: true, setupCompleted: false };
  }
};

export const updateSettings = (settings: Partial<AppSettings>): AppSettings => {
  try {
    const updateStmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
    
    for (const [key, value] of Object.entries(settings)) {
      updateStmt.run(String(value), key);
    }
    
    return getSettings();
  } catch (error) {
    console.error('更新设置失败:', error);
    return getSettings();
  }
};

export const isSetupCompleted = (): boolean => {
  try {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get('setupCompleted');
    return result ? result.value === 'true' : false;
  } catch (error) {
    console.error('检查设置状态失败:', error);
    return false;
  }
};

// 为了与其他代码的兼容性，我们保留一个数据库实例的导出
export default db;
