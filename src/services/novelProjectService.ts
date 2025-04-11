
import { v4 as uuidv4 } from 'uuid';
import { NovelProject, Chapter } from '@/types';

const LOCAL_STORAGE_KEY = 'novel-writer-data';

// Novel project operations
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
