
import React, { forwardRef } from 'react';
import { Textarea } from "@/components/ui/textarea";

interface EditorTextareaProps {
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  style: React.CSSProperties;
  isDraggingOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

const EditorTextarea = forwardRef<HTMLTextAreaElement, EditorTextareaProps>(
  ({ content, onChange, style, isDraggingOver, onDragOver, onDragLeave, onDrop }, ref) => {
    return (
      <div 
        className={`bg-editor-paper mx-auto max-w-4xl px-8 py-10 min-h-full shadow-sm ${isDraggingOver ? 'border-2 border-dashed border-primary' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <Textarea
          ref={ref}
          value={content}
          onChange={onChange}
          className="w-full h-full min-h-[calc(100vh-250px)] resize-none border-0 focus-visible:ring-0 p-0 whitespace-pre-wrap"
          placeholder="开始撰写您的小说..."
          style={style}
        />
      </div>
    );
  }
);

EditorTextarea.displayName = "EditorTextarea";

export default EditorTextarea;
