
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Download, Save, Home, LogOut, Settings } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  projectTitle: string;
  onSaveAll: () => void;
  onExport: () => void;
  username?: string;
  isOwner?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  projectTitle, 
  onSaveAll, 
  onExport,
  username = "",
  isOwner = false
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleSaveAll = () => {
    onSaveAll();
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "已登出",
      description: "您已成功登出系统"
    });
    navigate('/login');
  };

  const goToHome = () => {
    navigate('/');
  };

  const goToSettings = () => {
    navigate('/admin/settings');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center">
        <SidebarTrigger />
        <h1 className="ml-4 text-xl font-semibold">{projectTitle || "我的小说"}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">
          {username}
        </span>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goToHome}
        >
          <Home className="h-4 w-4" />
        </Button>
        
        {currentUser?.isAdmin && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goToSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        
        {isOwner && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveAll}
          >
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        )}
        
        <Button 
          size="sm" 
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" />
          导出
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
