
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Book, FileText, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Chapter } from '@/types';

interface ChapterSidebarProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  onChapterSelect: (id: string) => void;
  onAddChapter: (title: string) => void;
  onDeleteChapter: (id: string) => void;
  onRenameChapter: (id: string, newTitle: string) => void;
  readOnly?: boolean;
}

const ChapterSidebar: React.FC<ChapterSidebarProps> = ({
  chapters,
  activeChapterId,
  onChapterSelect,
  onAddChapter,
  onDeleteChapter,
  onRenameChapter,
  readOnly = false
}) => {
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [renameChapterId, setRenameChapterId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const { toast } = useToast();

  const handleAddChapter = () => {
    if (newChapterTitle.trim()) {
      onAddChapter(newChapterTitle);
      setNewChapterTitle("");
      setIsAddDialogOpen(false);
      toast({
        title: "章节已创建",
        description: `"${newChapterTitle}" 已添加到您的作品中`,
      });
    }
  };

  const handleRenameChapter = () => {
    if (renameChapterId && newTitle.trim()) {
      onRenameChapter(renameChapterId, newTitle);
      setRenameChapterId(null);
      toast({
        title: "章节已重命名",
        description: `章节已更名为 "${newTitle}"`,
      });
    }
  };

  const handleDeleteChapter = (id: string, title: string) => {
    if (confirm(`确定要删除章节 "${title}" 吗？`)) {
      onDeleteChapter(id);
      toast({
        title: "章节已删除",
        description: `"${title}" 已从您的作品中移除`,
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <Book className="h-5 w-5" />
          <h2 className="text-lg font-semibold">章节导航</h2>
        </div>
        {!readOnly && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">新建章节</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新章节</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="输入章节标题"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
              />
              <DialogFooter>
                <Button onClick={handleAddChapter}>创建</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {chapters.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <FileText className="mx-auto h-8 w-8 mb-2" />
              <p>没有章节</p>
              {!readOnly && (
                <p className="text-sm">点击"新建章节"按钮开始创作</p>
              )}
            </div>
          ) : (
            chapters.map((chapter) => (
              <SidebarMenuItem key={chapter.id}>
                <SidebarMenuButton
                  className={`flex justify-between w-full ${activeChapterId === chapter.id ? 'bg-sidebar-accent' : ''}`}
                  onClick={() => onChapterSelect(chapter.id)}
                >
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="truncate">{chapter.title}</span>
                  </div>
                  {!readOnly && (
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameChapterId(chapter.id);
                              setNewTitle(chapter.title);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>重命名章节</DialogTitle>
                          </DialogHeader>
                          <Input
                            placeholder="输入新标题"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                          />
                          <DialogFooter>
                            <Button onClick={handleRenameChapter}>保存</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChapter(chapter.id, chapter.title);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 text-xs text-center border-t">
        {readOnly ? (
          <p>预览模式 - 仅可查看</p>
        ) : (
          <>
            <p>本地存储小说编辑器</p>
            <p className="text-muted-foreground">您的作品保存在浏览器中</p>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChapterSidebar;
