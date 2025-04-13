
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChapterSidebar from '@/components/ChapterSidebar';
import Editor from '@/components/Editor';
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
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

const UserNovel: React.FC = () => {
  const [project, setProject] = useState<NovelProject | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if the current user is the owner of this project
  const isOwner = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    
    // Load the user's project
    const loadedProject = loadNovelProject(userId);
    if (loadedProject) {
      setProject(loadedProject);
      // If there are chapters, default to the first one
      if (loadedProject.chapters.length > 0) {
        setActiveChapterId(loadedProject.chapters[0].id);
      }
    } else if (isOwner) {
      // Create a new project for the owner if none exists
      const newProject = createNewProject();
      setProject(newProject);
      saveNovelProject(newProject, userId);
    } else {
      // If not the owner and no project, show message and return to user list
      toast({
        title: "无法找到作品",
        description: "该用户尚未创建任何作品",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [userId, isOwner, navigate, toast]);

  // Add auto-save functionality
  useEffect(() => {
    if (project && isOwner && userId) {
      const intervalId = setInterval(() => {
        saveNovelProject(project, userId);
      }, 60000); // Auto-save every minute
      
      return () => clearInterval(intervalId);
    }
  }, [project, isOwner, userId]);

  const getActiveChapter = (): Chapter | null => {
    if (!project || !activeChapterId) return null;
    return project.chapters.find(chapter => chapter.id === activeChapterId) || null;
  };

  const handleAddChapter = (title: string) => {
    if (!project || !isOwner || !userId) return;
    
    const updatedProject = addChapter(project, title);
    setProject(updatedProject);
    saveNovelProject(updatedProject, userId);
    
    // Select the newly created chapter
    const newChapterId = updatedProject.chapters[updatedProject.chapters.length - 1].id;
    setActiveChapterId(newChapterId);
  };

  const handleUpdateChapter = (chapterId: string, content: string) => {
    if (!project || !isOwner || !userId) return;
    
    const updatedProject = updateChapterService(project, chapterId, content);
    setProject(updatedProject);
    saveNovelProject(updatedProject, userId);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!project || !isOwner || !userId) return;
    
    const updatedProject = deleteChapterService(project, chapterId);
    setProject(updatedProject);
    saveNovelProject(updatedProject, userId);
    
    // If the deleted chapter was active, select the first chapter or clear selection
    if (chapterId === activeChapterId) {
      if (updatedProject.chapters.length > 0) {
        setActiveChapterId(updatedProject.chapters[0].id);
      } else {
        setActiveChapterId(null);
      }
    }
  };

  const handleRenameChapter = (chapterId: string, newTitle: string) => {
    if (!project || !isOwner || !userId) return;
    
    const updatedProject = renameChapterService(project, chapterId, newTitle);
    setProject(updatedProject);
    saveNovelProject(updatedProject, userId);
  };

  const handleSaveAll = () => {
    if (project && isOwner && userId) {
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
      description: `作品已导出为 ${fileName}`
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
          readOnly={!isOwner}
        />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Navbar 
            projectTitle={project.title}
            onSaveAll={handleSaveAll}
            onExport={handleExport}
            username={currentUser?.username || "游客"}
            isOwner={isOwner}
          />
          
          <div className="flex-1 overflow-hidden">
            <Editor 
              activeChapter={getActiveChapter()}
              updateChapter={handleUpdateChapter}
              readOnly={!isOwner}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UserNovel;
