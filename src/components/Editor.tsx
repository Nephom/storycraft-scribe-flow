
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BookOpen } from "lucide-react";
import { Chapter } from '@/types';
import { useAuth } from "@/contexts/AuthContext";
import EditorToolbar from './editor/EditorToolbar';
import EditorTextarea from './editor/EditorTextarea';
import EditorPreview from './editor/EditorPreview';
import NoChapterSelected from './editor/NoChapterSelected';
import { insertImageMarkdown } from './editor/ImageInsertUtils';

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
  const { isAuthenticated } = useAuth();
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

  const handleImageInsert = (file: File) => {
    if (!isAuthenticated) return;
    
    insertImageMarkdown(file, content, setContent, textareaRef, () => {
      toast({
        title: "图片已插入",
        description: "图片已成功插入到文档中",
        variant: "default"
      });
    });
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
        handleImageInsert(imageFile);
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
      handleImageInsert(files[0]);
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
    return <NoChapterSelected />;
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar 
        fontFamily={fontFamily}
        fontSize={fontSize}
        onFontFamilyChange={setFontFamily}
        onFontSizeChange={setFontSize}
        onSave={handleSave}
        onImageSelect={handleImageSelect}
      />
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileInputChange}
      />

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
            <EditorTextarea
              ref={textareaRef}
              content={content}
              onChange={handleChange}
              style={fontStyles}
              isDraggingOver={isDraggingOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          </TabsContent>
        )}
        
        <TabsContent value="preview" className="flex-1 p-4 overflow-auto bg-editor">
          <EditorPreview content={content} style={fontStyles} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Editor;
