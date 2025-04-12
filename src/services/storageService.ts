
import { v4 as uuidv4 } from 'uuid';
import { NovelProject, Chapter } from '@/types';

const LOCAL_STORAGE_KEY = 'novel-writer-data';
const LOCAL_USERS_KEY = 'users';
const LOCAL_ADMIN_SETTINGS_KEY = 'adminSettings';

// 用于小说项目的本地存储服务
export const saveNovelProject = (project: NovelProject): void => {
  try {
    const serialized = JSON.stringify({
      ...project,
      lastSaved: Date.now()
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

export const loadNovelProject = (): NovelProject | null => {
  try {
    const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized) as NovelProject;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return null;
  }
};

export const createNewProject = (title: string = '我的小说'): NovelProject => {
  return {
    title,
    chapters: [],
    lastSaved: Date.now()
  };
};

export const addChapter = (project: NovelProject, title: string): NovelProject => {
  const now = Date.now();
  const newChapter: Chapter = {
    id: uuidv4(),
    title,
    content: '',
    createdAt: now,
    updatedAt: now
  };
  
  return {
    ...project,
    chapters: [...project.chapters, newChapter],
    lastSaved: now
  };
};

export const updateChapter = (
  project: NovelProject, 
  chapterId: string, 
  content: string
): NovelProject => {
  const now = Date.now();
  const updatedChapters = project.chapters.map(chapter => 
    chapter.id === chapterId 
      ? { ...chapter, content, updatedAt: now }
      : chapter
  );
  
  return {
    ...project,
    chapters: updatedChapters,
    lastSaved: now
  };
};

export const deleteChapter = (
  project: NovelProject,
  chapterId: string
): NovelProject => {
  return {
    ...project,
    chapters: project.chapters.filter(chapter => chapter.id !== chapterId),
    lastSaved: Date.now()
  };
};

export const renameChapter = (
  project: NovelProject,
  chapterId: string,
  newTitle: string
): NovelProject => {
  const now = Date.now();
  const updatedChapters = project.chapters.map(chapter => 
    chapter.id === chapterId 
      ? { ...chapter, title: newTitle, updatedAt: now }
      : chapter
  );
  
  return {
    ...project,
    chapters: updatedChapters,
    lastSaved: now
  };
};

export const exportProject = (project: NovelProject): string => {
  let markdown = `# ${project.title}\n\n`;
  
  project.chapters.forEach(chapter => {
    markdown += `## ${chapter.title}\n\n`;
    markdown += `${chapter.content}\n\n`;
  });
  
  return markdown;
};

export const downloadAsFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// 用户数据库服务
// 注意：这是一个模拟的数据库服务，实际应用中应该替换为真实的数据库API调用
export type User = {
  id: string;
  username: string;
  passwordHash: string;
  isAdmin?: boolean;
};

let inMemoryUserDB: User[] = [];
let inMemoryAdminSettings = {
  allowRegistration: true,
  dashboardUrl: '/admin'
};

// 初始化内存数据库，从localStorage加载现有数据
export const initUserDatabase = (): void => {
  try {
    // 尝试从localStorage加载现有用户
    const storedUsers = localStorage.getItem(LOCAL_USERS_KEY);
    if (storedUsers) {
      inMemoryUserDB = JSON.parse(storedUsers);
    }

    // 尝试从localStorage加载管理员设置
    const storedSettings = localStorage.getItem(LOCAL_ADMIN_SETTINGS_KEY);
    if (storedSettings) {
      inMemoryAdminSettings = JSON.parse(storedSettings);
    }

    console.log('初始化用户数据库完成，加载了', inMemoryUserDB.length, '个用户');
  } catch (error) {
    console.error('初始化用户数据库错误:', error);
  }
};

// 同步内存数据库到localStorage（模拟数据库保存）
const syncUserDatabase = (): void => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(inMemoryUserDB));
    localStorage.setItem(LOCAL_ADMIN_SETTINGS_KEY, JSON.stringify(inMemoryAdminSettings));
  } catch (error) {
    console.error('同步用户数据库错误:', error);
  }
};

// 用于模拟密码哈希（实际应用中应使用bcrypt等安全算法）
const hashPassword = (password: string): string => {
  // 这只是一个简单的示例，实际生产环境应使用更安全的方法
  return `hashed_${password}_${Date.now()}`;
};

// 验证密码（模拟）
const verifyPassword = (plainPassword: string, hashedPassword: string): boolean => {
  // 这是一个非常简化的示例，实际应用中应使用正确的密码验证
  // 因为我们的哈希方法是简单的拼接，我们知道所有哈希都以"hashed_"开头
  return hashedPassword.startsWith(`hashed_${plainPassword}_`);
};

// 获取所有用户
export const getAllUsers = (): User[] => {
  return [...inMemoryUserDB].map(user => ({
    ...user,
    passwordHash: '****' // 不返回实际的密码哈希
  }));
};

// 创建新用户
export const createUser = (username: string, password: string, isAdmin: boolean = false): User | null => {
  // 检查用户名是否已存在
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
  syncUserDatabase();

  // 返回不含密码哈希的用户信息
  return {
    ...newUser,
    passwordHash: '****'
  };
};

// 验证用户登录
export const authenticateUser = (username: string, password: string): User | null => {
  const user = inMemoryUserDB.find(user => user.username === username);
  
  if (user && verifyPassword(password, user.passwordHash)) {
    // 返回不含密码哈希的用户信息
    return {
      ...user,
      passwordHash: '****'
    };
  }

  return null;
};

// 更新管理员设置
export const updateAdminSettings = (settings: Partial<typeof inMemoryAdminSettings>): void => {
  inMemoryAdminSettings = { ...inMemoryAdminSettings, ...settings };
  syncUserDatabase();
};

// 获取管理员设置
export const getAdminSettings = () => {
  return { ...inMemoryAdminSettings };
};

// 删除用户
export const deleteUser = (userId: string): boolean => {
  const initialLength = inMemoryUserDB.length;
  inMemoryUserDB = inMemoryUserDB.filter(user => user.id !== userId);
  
  if (inMemoryUserDB.length !== initialLength) {
    syncUserDatabase();
    return true;
  }
  
  return false;
};

// 初始化用户数据库
initUserDatabase();
