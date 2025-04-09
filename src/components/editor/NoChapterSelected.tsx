
import React from 'react';
import { FileText } from "lucide-react";

const NoChapterSelected: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">没有选择章节</h3>
        <p className="mt-2 text-sm text-gray-500">请从侧边栏选择一个章节或创建一个新章节</p>
      </div>
    </div>
  );
};

export default NoChapterSelected;
