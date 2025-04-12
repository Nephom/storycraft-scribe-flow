
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, authenticateUser, createUser, getAllUsers, getAdminSettings, updateAdminSettings } from '@/services/storageService';

interface AuthContextType {
  user: Omit<User, 'passwordHash'> | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string, isAdmin?: boolean) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  users: Omit<User, 'passwordHash'>[];
  isRegistrationAllowed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 在加载时检查本地存储是否有已登录用户
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('guestMode') === 'true';
  });

  const [users, setUsers] = useState<Omit<User, 'passwordHash'>[]>(() => {
    return getAllUsers();
  });

  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState<boolean>(() => {
    const settings = getAdminSettings();
    return settings.allowRegistration;
  });

  // 监听管理员设置变化
  useEffect(() => {
    // 定期检查管理员设置
    const checkAdminSettings = () => {
      const settings = getAdminSettings();
      setIsRegistrationAllowed(settings.allowRegistration);
    };

    const interval = setInterval(checkAdminSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  // 加载时检查管理员设置
  useEffect(() => {
    const settings = getAdminSettings();
    setIsRegistrationAllowed(settings.allowRegistration);
  }, []);

  // 定期刷新用户列表
  useEffect(() => {
    const refreshUsers = () => {
      setUsers(getAllUsers());
    };
    
    const interval = setInterval(refreshUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const isAuthenticated = !!user;

  // 修改后的注册函数
  const register = (username: string, password: string, isAdmin = false): boolean => {
    // 检查是否允许注册（除非是在没有用户时创建管理员账户）
    if (!isAdmin && !isRegistrationAllowed) {
      return false;
    }

    // 基本验证
    if (username.length < 3 || password.length < 6) {
      return false;
    }

    // 使用数据库服务创建用户
    const newUser = createUser(username, password, isAdmin);
    
    if (newUser) {
      // 自动登录新用户
      setUser(newUser);
      setIsGuest(false);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.removeItem('guestMode');
      
      // 刷新用户列表
      setUsers(getAllUsers());
      
      return true;
    }
    
    return false;
  };

  // 修改后的登录函数
  const login = (username: string, password: string): boolean => {
    // 使用数据库服务验证用户
    const authenticatedUser = authenticateUser(username, password);
    
    if (authenticatedUser) {
      setUser(authenticatedUser);
      setIsGuest(false);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      localStorage.removeItem('guestMode');
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('user');
    localStorage.removeItem('guestMode');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('guestMode', 'true');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      isAuthenticated, 
      isGuest, 
      continueAsGuest,
      users,
      isRegistrationAllowed
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
