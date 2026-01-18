import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    senderId: string;
    createdAt: Date;
    read: boolean;
    senderName?: string;
    senderRole?: string;
    isOwn: boolean;
  };
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  
  const formattedTime = format(message.createdAt, "HH:mm", { locale: fr });
  const formattedDate = format(message.createdAt, "dd MMMM yyyy", { locale: fr });
  
  // Détecter les URLs
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline text-blue-500 hover:text-blue-600"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Nom de l'expéditeur (seulement pour les messages reçus) */}
        {!isOwn && message.senderName && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <span className="text-sm font-medium text-gray-700">{message.senderName}</span>
            {message.senderRole && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                message.senderRole === 'ADMIN' ? 'bg-red-100 text-red-800' :
                message.senderRole === 'COACH' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {message.senderRole}
              </span>
            )}
          </div>
        )}
        
        {/* Bulle de message */}
        <div
          className={`relative px-4 py-3 rounded-2xl ${
            isOwn
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
          }`}
          onClick={() => setShowTimestamp(!showTimestamp)}
        >
          <p className="whitespace-pre-wrap break-words">
            {renderTextWithLinks(message.text)}
          </p>
          
          {/* Timestamp et statut */}
          <div className={`flex items-center justify-end mt-1 gap-2 ${
            showTimestamp ? 'opacity-100' : 'opacity-0'
          }`}>
            <span className="text-xs opacity-75">
              {formattedTime}
            </span>
            
            {isOwn && (
              <span className="flex items-center">
                {message.read ? (
                  <CheckCheck size={12} className="text-white opacity-75" />
                ) : (
                  <Check size={12} className="text-white opacity-75" />
                )}
              </span>
            )}
          </div>
        </div>
        
        {/* Date complète au clic */}
        {showTimestamp && (
          <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formattedDate} à {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
}