
export interface Chapter {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface NovelProject {
  title: string;
  chapters: Chapter[];
  lastSaved: number;
}
