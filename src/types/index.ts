
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
  isAdmin: boolean;
  novels: NovelProject[];
}

export interface RadiusSettings {
  server: string;
  port: number;
  secret: string;
  enabled: boolean;
}

export interface AppSettings {
  allowRegistration: boolean;
  radiusConfigured: boolean;
}
