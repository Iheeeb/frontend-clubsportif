import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      const newHeight = Math.min(textAreaRef.current.scrollHeight, 120);
      textAreaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);
  
  const handleSend = async () => {
    if (!text.trim() || sending || disabled) return;
    
    try {
      setSending(true);
      await onSendMessage(text);
      setText('');
      
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="relative">
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tapez votre message..."
        disabled={disabled || sending}
        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        rows={1}
        style={{ maxHeight: '120px', overflowY: 'auto' }}
      />
      
      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim() || sending || disabled}
        className={`absolute right-2 bottom-2 p-2 rounded-full transition-colors ${
          text.trim() && !sending && !disabled
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'text-gray-400 bg-gray-100 cursor-not-allowed'
        }`}
      >
        <Send size={18} className={sending ? 'animate-pulse' : ''} />
      </button>
      
      {text.length > 0 && (
        <div className="absolute right-14 bottom-3 text-xs text-gray-500">
          {text.length} caractères
        </div>
      )}
    </div>
  );
}