
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, BookOpen, ArrowLeft, Edit } from 'lucide-react';
import { NovelProject } from '@/types';
import { loadNovelProject } from '@/services/storageService';
import MarkdownPreview from '@/components/MarkdownPreview';

const UserPreview = () => {
  const { username } = useParams<{ username: string }>();
  const { users, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<NovelProject | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user exists
  const userExists = users.some(u => u.username === username);
  
  // Check if current user can edit (viewing their own page)
  const canEdit = username === currentUser?.username;

  useEffect(() => {
    // Load project data
    const loadProject = () => {
      setLoading(true);
      try {
        const loadedProject = loadNovelProject();
        setProject(loadedProject);
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          variant: "destructive",
          title: "錯誤",
          description: "無法加載用戶作品",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userExists) {
      loadProject();
    } else {
      setLoading(false);
    }
  }, [username, toast, userExists]);

  if (!userExists) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">用戶不存在</h1>
        <p className="text-gray-600 mb-6">找不到用戶 "{username}"</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">{username} 的作品</h1>
        <p className="text-gray-600 mb-6">此用戶尚未創建任何作品</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首頁
          </Button>
          <h1 className="text-xl font-semibold ml-4">{username} 的作品: {project.title}</h1>
        </div>
        {canEdit && (
          <Button onClick={() => navigate('/')} size="sm">
            <Edit className="mr-2 h-4 w-4" />
            編輯我的作品
          </Button>
        )}
      </header>

      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm rounded-lg">
          {project.chapters.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">目前沒有章節</p>
            </div>
          ) : (
            <div className="space-y-12">
              {project.chapters.map(chapter => (
                <div key={chapter.id} className="pb-8 border-b border-gray-100 last:border-b-0">
                  <h2 className="text-2xl font-bold mb-4">{chapter.title}</h2>
                  <div className="prose max-w-none">
                    <MarkdownPreview 
                      content={chapter.content} 
                      style={{ fontSize: '16px', fontFamily: 'serif' }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserPreview;
