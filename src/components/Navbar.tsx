
import React from 'react';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Download, Save, LogOut, User, Eye, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  projectTitle: string;
  onSaveAll: () => void;
  onExport: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ projectTitle, onSaveAll, onExport }) => {
  const { toast } = useToast();
  const { user, logout, isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();

  const handleSaveAll = () => {
    onSaveAll();
    toast({
      title: "全部保存",
      description: "所有章节已成功保存",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "已登出",
      description: "您已成功登出系统",
    });
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center">
        <SidebarTrigger />
        <h1 className="ml-4 text-xl font-semibold">{projectTitle || "我的小说"}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {isAuthenticated && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveAll}
            >
              <Save className="mr-2 h-4 w-4" />
              全部保存
            </Button>
            <Button 
              size="sm" 
              onClick={onExport}
            >
              <Download className="mr-2 h-4 w-4" />
              导出作品
            </Button>
            <div className="ml-4 flex items-center">
              <span className="mr-2 text-sm">
                <User className="inline mr-1 h-4 w-4" />
                {user?.username}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                登出
              </Button>
            </div>
          </>
        )}
        {isGuest && (
          <>
            <Button 
              size="sm" 
              onClick={onExport}
            >
              <Download className="mr-2 h-4 w-4" />
              导出作品
            </Button>
            <div className="ml-4 flex items-center">
              <span className="mr-2 text-sm text-amber-500">
                <Eye className="inline mr-1 h-4 w-4" />
                访客模式
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/login')}
              >
                <LogIn className="mr-2 h-4 w-4" />
                登录
              </Button>
            </div>
          </>
        )}
        {!isAuthenticated && !isGuest && (
          <Button 
            size="sm" 
            onClick={() => navigate('/login')}
          >
            <User className="mr-2 h-4 w-4" />
            登录
          </Button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
