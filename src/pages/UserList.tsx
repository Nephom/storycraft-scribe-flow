
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Settings, User } from 'lucide-react';

const UserList: React.FC = () => {
  const { users, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate]);

  const handleUserClick = (userId: string) => {
    // Navigate to the user's novel page
    navigate(`/user/${userId}`);
  };

  const goToSettings = () => {
    navigate('/admin/settings');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">用户列表</h1>
        </div>
        
        {currentUser?.isAdmin && (
          <Button onClick={goToSettings} variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            管理设置
          </Button>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <Card 
            key={user.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleUserClick(user.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {user.username}
              </CardTitle>
              <CardDescription>
                {user.novels.length} 部作品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Button variant="ghost" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  查看作品
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {users.length === 0 && (
          <div className="col-span-full text-center py-12">
            <User className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">暂无用户</h3>
            <p className="text-muted-foreground mt-2">系统中尚未创建任何用户</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
