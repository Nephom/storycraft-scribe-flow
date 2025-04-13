
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import MarkdownPreview from './MarkdownPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, FileText, BookOpen } from "lucide-react";
import { Chapter } from '@/types';

interface EditorProps {
  activeChapter: Chapter | null;
  updateChapter: (id: string, content: string) => void;
  readOnly?: boolean;
}

const Editor: React.FC<EditorProps> = ({ activeChapter, updateChapter, readOnly = false }) => {
  const [content, setContent] = useState("");
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("sans");
  const [textColor, setTextColor] = useState("black");
  const [characterCount, setCharacterCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (activeChapter) {
      setContent(activeChapter.content);
      setCharacterCount(activeChapter.content.length);
    } else {
      setContent("");
      setCharacterCount(0);
    }
  }, [activeChapter]);

  const handleSave = () => {
    if (activeChapter && !readOnly) {
      updateChapter(activeChapter.id, content);
      toast({
        title: "已保存",
        description: `章节 "${activeChapter.title}" 已成功保存`,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCharacterCount(newContent.length);
  };

  const fontStyles = {
    fontFamily: fontFamily === 'sans' ? 'Inter, sans-serif' : 
                fontFamily === 'serif' ? 'Georgia, serif' : 
                fontFamily === 'mono' ? 'Consolas, monospace' :
                fontFamily === 'fangsong' ? 'FangSong, STFangsong, serif' :
                'Inter, sans-serif',
    fontSize: `${fontSize}px`,
    color: textColor
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
          <Select value={fontFamily} onValueChange={setFontFamily} disabled={readOnly}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="字体" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sans">无衬线体</SelectItem>
              <SelectItem value="serif">衬线体</SelectItem>
              <SelectItem value="mono">等宽体</SelectItem>
              <SelectItem value="fangsong">仿宋体</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={fontSize} onValueChange={setFontSize} disabled={readOnly}>
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

          <Select value={textColor} onValueChange={setTextColor} disabled={readOnly}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="颜色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="black">黑色</SelectItem>
              <SelectItem value="#333333">深灰</SelectItem>
              <SelectItem value="#0000FF">蓝色</SelectItem>
              <SelectItem value="#008000">绿色</SelectItem>
              <SelectItem value="#800000">棕色</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {!readOnly && (
          <Button onClick={handleSave} variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        )}
      </div>

      <Tabs defaultValue="write" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="write" className="flex items-center" disabled={readOnly}>
            <FileText className="mr-2 h-4 w-4" />
            编辑
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            预览
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="flex-1 p-4 overflow-auto bg-editor">
          <div className="bg-editor-paper mx-auto max-w-4xl px-8 py-10 min-h-full shadow-sm">
            <Textarea
              value={content}
              onChange={handleChange}
              className="w-full h-full min-h-[calc(100vh-250px)] resize-none border-0 focus-visible:ring-0 p-0"
              placeholder="开始撰写您的小说..."
              style={fontStyles}
              readOnly={readOnly}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 p-4 overflow-auto bg-editor">
          <div className="bg-editor-paper mx-auto max-w-4xl px-8 py-10 min-h-full shadow-sm">
            <MarkdownPreview content={content} style={fontStyles} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-2 text-right text-sm text-muted-foreground border-t">
        字数统计: {characterCount} 个字符
      </div>
    </div>
  );
};

export default Editor;
