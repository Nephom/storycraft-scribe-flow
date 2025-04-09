
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ImageIcon, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface EditorToolbarProps {
  fontFamily: string;
  fontSize: string;
  onFontFamilyChange: (value: string) => void;
  onFontSizeChange: (value: string) => void;
  onSave: () => void;
  onImageSelect: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  fontFamily,
  fontSize,
  onFontFamilyChange,
  onFontSizeChange,
  onSave,
  onImageSelect
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-4">
        <Select value={fontFamily} onValueChange={onFontFamilyChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="字体" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sans">无衬线体</SelectItem>
            <SelectItem value="serif">衬线体</SelectItem>
            <SelectItem value="mono">等宽体</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={fontSize} onValueChange={onFontSizeChange}>
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
            onClick={onImageSelect}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            插入图片
          </Button>
        )}
      </div>
      
      {isAuthenticated ? (
        <Button onClick={onSave} variant="outline" size="sm">
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
  );
};

export default EditorToolbar;
