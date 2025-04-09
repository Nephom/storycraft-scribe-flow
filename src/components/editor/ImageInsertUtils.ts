
import { MutableRefObject } from 'react';

/**
 * Inserts image markdown at cursor position
 */
export const insertImageMarkdown = (
  file: File,
  content: string,
  setContent: (content: string) => void,
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>,
  onSuccess?: () => void
) => {
  if (!textareaRef.current) return;

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

    if (onSuccess) {
      onSuccess();
    }
  };
  reader.readAsDataURL(file);
};
