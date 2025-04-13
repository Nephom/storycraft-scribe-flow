
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChapterSidebar from '@/components/ChapterSidebar';
import Editor from '@/components/Editor';
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUser } from '@/services/dbService';
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
  const [isReadOnly, setIsReadOnly] = useState(false);
  const { toast } = useToast();
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if trying to access another user's data without being logged in
    if (!userId) {
      navigate('/');
      return;
    }
    
    // Get the target user
    const targetUser = getUser(userId);
    if (!targetUser) {
      toast({
        title: "错误",
        description: "找不到指定的用户",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    // Set read-only mode if current user is not the owner
    const isOwner = currentUser && currentUser.id === userId;
    setIsReadOnly(!isOwner);
    
    // 尝试从 localStorage 加载项目
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
      if (isOwner) {
        saveNovelProject(newProject);
      }
    }
  }, [userId, currentUser, navigate, toast]);

  // 添加一个自动保存功能
  useEffect(() => {
    if (project && !isReadOnly) {
      const intervalId = setInterval(() => {
        saveNovelProject(project);
      }, 60000); // 每分钟自动保存一次
      
      return () => clearInterval(intervalId);
    }
  }, [project, isReadOnly]);

  const getActiveChapter = (): Chapter | null => {
    if (!project || !activeChapterId) return null;
    return project.chapters.find(chapter => chapter.id === activeChapterId) || null;
  };

  const handleAddChapter = (title: string) => {
    if (!project || isReadOnly) return;
    
    const updatedProject = addChapter(project, title);
    setProject(updatedProject);
    saveNovelProject(updatedProject);
    
    // 选择新创建的章节
    const newChapterId = updatedProject.chapters[updatedProject.chapters.length - 1].id;
    setActiveChapterId(newChapterId);
  };

  const handleUpdateChapter = (chapterId: string, content: string) => {
    if (!project || isReadOnly) return;
    
    const updatedProject = updateChapterService(project, chapterId, content);
    setProject(updatedProject);
    saveNovelProject(updatedProject);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!project || isReadOnly) return;
    
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
    if (!project || isReadOnly) return;
    
    const updatedProject = renameChapterService(project, chapterId, newTitle);
    setProject(updatedProject);
    saveNovelProject(updatedProject);
  };

  const handleSaveAll = () => {
    if (project && !isReadOnly) {
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
          readOnly={isReadOnly}
        />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Navbar 
            projectTitle={project.title}
            onSaveAll={handleSaveAll}
            onExport={handleExport}
            readOnly={isReadOnly}
          />
          
          <div className="flex-1 overflow-hidden">
            <Editor 
              activeChapter={getActiveChapter()}
              updateChapter={handleUpdateChapter}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
