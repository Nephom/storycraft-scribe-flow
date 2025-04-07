
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChapterSidebar from '@/components/ChapterSidebar';
import Editor from '@/components/Editor';
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { NovelProject, Chapter } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // 页面加载时尝试从 localStorage 加载项目
    const loadedProject = loadNovelProject();
    if (loadedProject) {
      setProject(loadedProject);
      // 如果有章节，默认选中第一个
      if (loadedProject.chapters.length > 0) {
        setActiveChapterId(loadedProject.chapters[0].id);
      }
    } else {
      // 如果没有已保存的项目，创建一个新的
      const newProject = createNewProject();
      setProject(newProject);
      saveNovelProject(newProject);
    }
  }, []);

  // 添加一个自动保存功能，只对已登录用户生效
  useEffect(() => {
    if (project && isAuthenticated) {
      const intervalId = setInterval(() => {
        saveNovelProject(project);
      }, 60000); // 每分钟自动保存一次
      
      return () => clearInterval(intervalId);
    }
  }, [project, isAuthenticated]);

  const getActiveChapter = (): Chapter | null => {
    if (!project || !activeChapterId) return null;
    return project.chapters.find(chapter => chapter.id === activeChapterId) || null;
  };

  const handleAddChapter = (title: string) => {
    if (!project || !isAuthenticated) return;
    
    const updatedProject = addChapter(project, title);
    setProject(updatedProject);
    saveNovelProject(updatedProject);
    
    // 选择新创建的章节
    const newChapterId = updatedProject.chapters[updatedProject.chapters.length - 1].id;
    setActiveChapterId(newChapterId);
  };

  const handleUpdateChapter = (chapterId: string, content: string) => {
    if (!project || !isAuthenticated) return;
    
    const updatedProject = updateChapterService(project, chapterId, content);
    setProject(updatedProject);
    saveNovelProject(updatedProject);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!project || !isAuthenticated) return;
    
    const updatedProject = deleteChapterService(project, chapterId);
    setProject(updatedProject);
    saveNovelProject(updatedProject);
    
    // 如果删除的是当前活动章节，则选择第一个章节或清除选择
    if (chapterId === activeChapterId) {
      if (updatedProject.chapters.length > 0) {
        setActiveChapterId(updatedProject.chapters[0].id);
      } else {
        setActiveChapterId(null);
      }
    }
  };

  const handleRenameChapter = (chapterId: string, newTitle: string) => {
    if (!project || !isAuthenticated) return;
    
    const updatedProject = renameChapterService(project, chapterId, newTitle);
    setProject(updatedProject);
    saveNovelProject(updatedProject);
  };

  const handleSaveAll = () => {
    if (project && isAuthenticated) {
      saveNovelProject(project);
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
          isReadOnly={!isAuthenticated}
        />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Navbar 
            projectTitle={project.title}
            onSaveAll={handleSaveAll}
            onExport={handleExport}
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
