
import React from 'react';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Download, Save, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';

interface NavbarProps {
  projectTitle: string;
  onSaveAll: () => void;
  onExport: () => void;
  readOnly?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ projectTitle, onSaveAll, onExport, readOnly = false }) => {
  const { toast } = useToast();

  const handleSaveAll = () => {
    onSaveAll();
    toast({
      title: "全部保存",
      description: "所有章节已成功保存",
    });
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center">
        <Link to="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <SidebarTrigger />
        <h1 className="ml-4 text-xl font-semibold">{projectTitle || "我的小说"}</h1>
        {readOnly && (
          <span className="ml-2 px-2 py-1 text-xs bg-muted rounded-full">
            只读模式
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {!readOnly && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveAll}
          >
            <Save className="mr-2 h-4 w-4" />
            全部保存
          </Button>
        )}
        <Button 
          size="sm" 
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" />
          导出作品
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
