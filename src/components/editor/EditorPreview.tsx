
import React from 'react';
import MarkdownPreview from '../MarkdownPreview';

interface EditorPreviewProps {
  content: string;
  style: React.CSSProperties;
}

const EditorPreview: React.FC<EditorPreviewProps> = ({ content, style }) => {
  return (
    <div className="bg-editor-paper mx-auto max-w-4xl px-8 py-10 min-h-full shadow-sm">
      <MarkdownPreview content={content} style={style} />
    </div>
  );
};

export default EditorPreview;
