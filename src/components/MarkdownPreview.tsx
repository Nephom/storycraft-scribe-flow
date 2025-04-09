
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
  style?: React.CSSProperties;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, style }) => {
  return (
    <div className="markdown-preview" style={style}>
      <ReactMarkdown
        components={{
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="max-w-full h-auto my-4 rounded-md"
              alt={props.alt || 'Illustration'}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
