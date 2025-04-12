
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users } from 'lucide-react';

const Index = () => {
  const [project, setProject] = useState<NovelProject | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated, isGuest, users } = useAuth();

  useEffect(() => {
    // Try to load project from localStorage when page loads
    const loadedProject = loadNovelProject();
    if (loadedProject) {
      setProject(loadedProject);
      // Default to first chapter if available
      if (loadedProject.chapters.length > 0) {
        setActiveChapterId(loadedProject.chapters[0].id);
      }
    } else {
      // Create new project if none exists
      const newProject = createNewProject();
      setProject(newProject);
      saveNovelProject(newProject);
    }
  }, []);

  // Auto-save for authenticated users
  useEffect(() => {
    if (project && isAuthenticated) {
      const intervalId = setInterval(() => {
        saveNovelProject(project);
      }, 60000); // Save every minute
      
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
    
    // Select the newly created chapter
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
    
    // If deleted active chapter, select first chapter or clear selection
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
    const fileName = `${project.title || '我的小說'}.md`;
    downloadAsFile(markdown, fileName, 'text/markdown');
    
    toast({
      title: "導出成功",
      description: `您的作品已導出為 ${fileName}`,
    });
  };

  if (!project) {
    return <div className="flex justify-center items-center h-screen">加載中...</div>;
  }

  // Show users list if guest or not authenticated
  if (isGuest || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">小說創作平台</h1>
            <p className="text-gray-600">請選擇一個用戶查看其作品或登錄以編輯自己的作品</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                用戶列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  目前沒有用戶
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {users.map((u) => (
                    <Link 
                      to={`/user/${u.username}`} 
                      key={u.username}
                      className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-gray-500">
                          {u.isAdmin ? '管理員' : '普通用戶'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show editor for authenticated users
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
