
interface Chapter {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface NovelProject {
  title: string;
  chapters: Chapter[];
  lastSaved: number;
}

interface User {
  id: string;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: number;
  novels: NovelProject[];
}

interface AppSettings {
  allowRegistration: boolean;
  setupCompleted: boolean;
}

export type { Chapter, NovelProject, User, AppSettings };
