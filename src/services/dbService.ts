
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { User, AppSettings } from '@/types';
import bcrypt from 'bcryptjs';

// Initialize database
const db = new Database('novels.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS novels (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    last_saved INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    allow_registration INTEGER NOT NULL DEFAULT 1,
    setup_completed INTEGER NOT NULL DEFAULT 0
  );
`);

// Insert default settings if they don't exist
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
if (settingsCount.count === 0) {
  db.prepare('INSERT INTO settings (id, allow_registration, setup_completed) VALUES (1, 1, 0)').run();
}

// User functions
export const createUser = (username: string, password: string, isAdmin: boolean = false): User => {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = uuidv4();
  const now = Date.now();

  db.prepare(`
    INSERT INTO users (id, username, password_hash, is_admin, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, username, passwordHash, isAdmin ? 1 : 0, now);

  return {
    id: userId,
    username,
    passwordHash,
    isAdmin,
    createdAt: now,
    novels: []
  };
};

export const verifyUser = (username: string, password: string): User | null => {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    passwordHash: user.password_hash,
    isAdmin: Boolean(user.is_admin),
    createdAt: user.created_at,
    novels: [] // Novels are loaded separately
  };
};

export const getUser = (userId: string): User | null => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    passwordHash: user.password_hash,
    isAdmin: Boolean(user.is_admin),
    createdAt: user.created_at,
    novels: [] // Novels are loaded separately
  };
};

export const getAllUsers = (): User[] => {
  const users = db.prepare('SELECT * FROM users').all() as any[];
  
  return users.map(user => ({
    id: user.id,
    username: user.username,
    passwordHash: user.password_hash,
    isAdmin: Boolean(user.is_admin),
    createdAt: user.created_at,
    novels: [] // Novels are loaded separately
  }));
};

// Settings functions
export const getSettings = (): AppSettings => {
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any;
  
  return {
    allowRegistration: Boolean(settings.allow_registration),
    setupCompleted: Boolean(settings.setup_completed)
  };
};

export const updateSettings = (settings: Partial<AppSettings>): AppSettings => {
  const updates = [];
  const params = [];

  if (settings.allowRegistration !== undefined) {
    updates.push('allow_registration = ?');
    params.push(settings.allowRegistration ? 1 : 0);
  }

  if (settings.setupCompleted !== undefined) {
    updates.push('setup_completed = ?');
    params.push(settings.setupCompleted ? 1 : 0);
  }

  if (updates.length > 0) {
    db.prepare(`
      UPDATE settings
      SET ${updates.join(', ')}
      WHERE id = 1
    `).run(...params);
  }

  return getSettings();
};

export const isSetupCompleted = (): boolean => {
  const settings = getSettings();
  return settings.setupCompleted;
};

export default db;
