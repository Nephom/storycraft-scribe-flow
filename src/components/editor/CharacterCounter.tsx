
import React from 'react';

interface CharacterCounterProps {
  content: string;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ content }) => {
  const charCount = content.length;
  
  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-3 py-1 rounded-md text-sm shadow-md opacity-70 hover:opacity-100 transition-opacity">
      {charCount} 字元
    </div>
  );
};

export default CharacterCounter;
