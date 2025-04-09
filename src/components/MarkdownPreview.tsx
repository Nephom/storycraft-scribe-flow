
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
  style?: React.CSSProperties;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, style }) => {
  return (
    <div className="markdown-preview" style={style}>
      <ReactMarkdown
        remarkPlugins={[[remarkGfm], [remarkBreaks]]}
        components={{
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="max-w-full h-auto my-4 rounded-md"
              alt={props.alt || 'Illustration'}
              src={props.src || ''}
              loading="lazy"
            />
          ),
          p: ({ children }) => <p className="mb-4">{children}</p>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 py-1 mb-4 italic">{children}</blockquote>,
          code: ({ children }) => <code className="bg-gray-100 px-1 rounded">{children}</code>,
          pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded mb-4 overflow-x-auto">{children}</pre>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
