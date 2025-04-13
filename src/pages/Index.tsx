import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChapterSidebar from '@/components/ChapterSidebar';
import Editor from '@/components/Editor';
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { NovelProject, Chapter } from '@/types';
import { 
  loadNovelProject, 
  saveNovelProject, 
  createNewProject, 
  addChapter,
  updateChapter as updateChapterService,
  deleteChapter as deleteChapterService,
  renameChapter as renameChapterService,
  exportProject,
  downloadAsFile
} from '@/services/storageService';

const Index = () => {
  const [project, setProject] = useState<NovelProject | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'default';

  useEffect(() => {
    const loadedProject = loadNovelProject(userId);
    if (loadedProject) {
      setProject(loadedProject);
      if (loadedProject.chapters.length > 0) {
        setActiveChapterId(loadedProject.chapters[0].id);
      }
    } else {
      const newProject = createNewProject();
      setProject(newProject);
      saveNovelProject(newProject, userId);
    }
  }, [userId]);

  useEffect(() => {
    if (project) {
      const intervalId = setInterval(() => {
        saveNovelProject(project, userId);
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [project, userId]);

  const getActiveChapter = (): Chapter | null => {
    if (!project || !activeChapterId) return null;
    return project.chapters.find(chapter => chapter.id === activeChapterId) || null;
  };

  const handleAddChapter = (title: string) => {
    if (!project) return;
    
    const updatedProject = addChapter(project, title);
    setProject(updatedProject);
    saveNovelProject(updatedProject, userId);
    
    const newChapterId = updatedProject.chapters[updatedProject.chapters.length - 1].id;
    setActiveChapterId(newChapterId);
  };

  const handleUpdateChapter = (chapterId: string, content: string) => {
    if (!project) return;
    
    const updatedProject = updateChapterService(project, chapterId, content);
    setProject(updatedProject);
    saveNovelProject(updatedProject, userId);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!project) return;
    
    const updatedProject = deleteChapterService(project, chapterId);
    setProject(updatedProject);
    saveNovelProject(updatedProject, userId);
    
    if (chapterId === activeChapterId) {
      if (updatedProject.chapters.length > 0) {
        setActiveChapterId(updatedProject.chapters[0].id);
      } else {
        setActiveChapterId(null);
      }
    }
  };

  const handleRenameChapter = (chapterId: string, newTitle: string) => {
    if (!project) return;
    
    const updatedProject = renameChapterService(project, chapterId, newTitle);
    setProject(updatedProject);
    saveNovelProject(updatedProject, userId);
  };

  const handleSaveAll = () => {
    if (project) {
      saveNovelProject(project, userId);
      toast({
        title: "保存成功",
        description: "所有章节已保存"
      });
    }
  };

  const handleExport = () => {
    if (!project) return;
    
    const markdown = exportProject(project);
    const fileName = `${project.title || '我的小说'}.md`;
    downloadAsFile(markdown, fileName, 'text/markdown');
    
    toast({
      title: "导出成功",
      description: `您的作品已导出为 ${fileName}`,
    });
  };

  if (!project) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ChapterSidebar
          chapters={project.chapters}
          activeChapterId={activeChapterId}
          onChapterSelect={setActiveChapterId}
          onAddChapter={handleAddChapter}
          onDeleteChapter={handleDeleteChapter}
          onRenameChapter={handleRenameChapter}
        />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Navbar 
            projectTitle={project.title}
            onSaveAll={handleSaveAll}
            onExport={handleExport}
            username={currentUser?.username}
            isOwner={true}
          />
          
          <div className="flex-1 overflow-hidden">
            <Editor 
              activeChapter={getActiveChapter()}
              updateChapter={handleUpdateChapter}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
