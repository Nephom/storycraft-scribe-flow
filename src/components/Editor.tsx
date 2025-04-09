import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import MarkdownPreview from './MarkdownPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, FileText, BookOpen, Lock, ImageIcon } from "lucide-react";
import { Chapter } from '@/types';
import { useAuth } from "@/contexts/AuthContext";

interface EditorProps {
  activeChapter: Chapter | null;
  updateChapter: (id: string, content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ activeChapter, updateChapter }) => {
  const [content, setContent] = useState("");
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("sans");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isGuest } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeChapter) {
      setContent(activeChapter.content);
    } else {
      setContent("");
    }
  }, [activeChapter]);

  const handleSave = () => {
    if (activeChapter && isAuthenticated) {
      updateChapter(activeChapter.id, content);
      toast({
        title: "已保存",
        description: `章节 "${activeChapter.title}" 已成功保存`,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isAuthenticated) {
      setContent(e.target.value);
    }
  };

  const insertImageMarkdown = (file: File) => {
    if (!isAuthenticated || !textareaRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target || !e.target.result) return;

      const imageDataUrl = e.target.result.toString();
      const imageMarkdown = `![${file.name}](${imageDataUrl})`;
      
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      
      // Insert the markdown at cursor position
      const newContent = 
        content.substring(0, cursorPosition) + 
        "\n\n" + imageMarkdown + "\n\n" + 
        content.substring(cursorPosition);
      
      setContent(newContent);
      
      // Move cursor after the inserted image markdown
      setTimeout(() => {
        const newPosition = cursorPosition + imageMarkdown.length + 4; // 4 is for the two newlines
        textarea.focus();
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);

      toast({
        title: "图片已插入",
        description: "图片已成功插入到文档中",
        variant: "default"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (!isAuthenticated) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFile = Array.from(files).find(file => file.type.startsWith('image/'));
      if (imageFile) {
        insertImageMarkdown(imageFile);
      } else {
        toast({
          title: "不支持的文件类型",
          description: "只能插入图片文件",
          variant: "destructive"
        });
      }
    }
  };

  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      insertImageMarkdown(files[0]);
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fontStyles = {
    fontFamily: fontFamily === 'sans' ? 'Inter, sans-serif' : 
                fontFamily === 'serif' ? 'Georgia, serif' : 
                'Consolas, monospace',
    fontSize: `${fontSize}px`
  };

  if (!activeChapter) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">没有选择章节</h3>
          <p className="mt-2 text-sm text-gray-500">请从侧边栏选择一个章节或创建一个新章节</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-4">
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="字体" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sans">无衬线体</SelectItem>
              <SelectItem value="serif">衬线体</SelectItem>
              <SelectItem value="mono">等宽体</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="字号" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
              <SelectItem value="20">20px</SelectItem>
              <SelectItem value="24">24px</SelectItem>
            </SelectContent>
          </Select>

          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleImageSelect}
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              插入图片
            </Button>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileInputChange}
          />
        </div>
        
        {isAuthenticated ? (
          <Button onClick={handleSave} variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        ) : (
          <div className="text-amber-500 flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            <span className="text-xs">访客模式 - 只读</span>
          </div>
        )}
      </div>

      <Tabs defaultValue={isAuthenticated ? "write" : "preview"} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          {isAuthenticated ? (
            <>
              <TabsTrigger value="write" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                编辑
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                预览
              </TabsTrigger>
            </>
          ) : (
            <TabsTrigger value="preview" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              阅读
            </TabsTrigger>
          )}
        </TabsList>
        
        {isAuthenticated && (
          <TabsContent value="write" className="flex-1 p-4 overflow-auto bg-editor">
            <div 
              className={`bg-editor-paper mx-auto max-w-4xl px-8 py-10 min-h-full shadow-sm ${isDraggingOver ? 'border-2 border-dashed border-primary' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                className="w-full h-full min-h-[calc(100vh-250px)] resize-none border-0 focus-visible:ring-0 p-0 whitespace-pre-wrap"
                placeholder="开始撰写您的小说..."
                style={fontStyles}
              />
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="preview" className="flex-1 p-4 overflow-auto bg-editor">
          <div className="bg-editor-paper mx-auto max-w-4xl px-8 py-10 min-h-full shadow-sm">
            <MarkdownPreview content={content} style={fontStyles} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Editor;
