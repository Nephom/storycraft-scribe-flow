
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'novel-writer-data';

export const saveNovelProject = (project: NovelProject, userId: string): void => {
  try {
    const userProjects = getUserProjects();
    userProjects[userId] = {
      ...project,
      lastSaved: Date.now()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProjects));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

export const loadNovelProject = (userId: string): NovelProject | null => {
  try {
    const userProjects = getUserProjects();
    if (!userProjects[userId]) return null;
    return userProjects[userId] as NovelProject;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return null;
  }
};

// Helper to get all user projects
const getUserProjects = (): Record<string, NovelProject> => {
  try {
    const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serialized) return {};
    return JSON.parse(serialized) as Record<string, NovelProject>;
  } catch (error) {
    console.error('Error loading projects from localStorage:', error);
    return {};
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
