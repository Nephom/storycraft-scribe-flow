
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
