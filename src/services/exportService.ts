
import { NovelProject } from '@/types';

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
