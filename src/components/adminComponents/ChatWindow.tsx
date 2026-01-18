import { useState, useEffect, useRef } from "react";
import { User } from '../../services/userService';
import { Conversation, Message as ApiMessage } from '../../services/messageService';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ArrowLeft } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: User;
  allUsers: User[];
  onSendMessage: (conversationId: string, content: string) => void;
  onBack?: () => void;
}

export function ChatWindow({ conversation, currentUser, allUsers, onSendMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<ApiMessage[]>(conversation.messages);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mettre à jour les messages quand la conversation change
  useEffect(() => {
    setMessages(conversation.messages);
    
    // Marquer les messages comme lus
    const markAsSeen = async () => {
      const unreadMessages = conversation.messages.filter(
        msg => msg.statut === 'sent' && msg.id_emetteur !== currentUser.id
      );
      
      // Ici, vous pourriez appeler une API pour marquer comme vu
      // await Promise.all(unreadMessages.map(msg => messageService.markAsSeen(msg.id_message)));
    };
    
    markAsSeen();
  }, [conversation]);
  
  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Envoyer un message
  const handleSendMessage = async (content: string) => {
    await onSendMessage(conversation.id, content);
  };
  
  // Obtenir l'autre participant
  const otherParticipant = conversation.participants.find(id => id !== currentUser.id);
  const otherUser = otherParticipant ? allUsers.find(u => u.id === otherParticipant) : null;
  
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Sélectionnez une conversation
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="p-4 border-b flex items-center gap-3 bg-white">
        {otherUser ? (
          <>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              otherUser.role === 'ADMIN' ? 'bg-red-100' :
              otherUser.role === 'COACH' ? 'bg-green-100' :
              'bg-blue-100'
            }`}>
              <span className={`font-semibold ${
                otherUser.role === 'ADMIN' ? 'text-red-600' :
                otherUser.role === 'COACH' ? 'text-green-600' :
                'text-blue-600'
              }`}>
                {otherUser.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-medium text-gray-900">{otherUser.fullName}</h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  otherUser.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  otherUser.role === 'COACH' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {otherUser.role}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    otherUser.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                  {otherUser.status === 'ACTIVE' ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 className="font-medium text-gray-900">
              {conversation.participantNames[conversation.participants.find(id => id !== currentUser.id) || 0]}
            </h2>
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <h3 className="font-medium mb-2">Aucun message</h3>
            <p className="text-sm">Envoyez le premier message pour commencer la conversation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.id_emetteur === currentUser.id;
              const sender = isOwn ? currentUser : allUsers.find(u => u.id === message.id_emetteur);
              const showDateHeader = index === 0 || 
                new Date(message.date_envoi).toDateString() !== 
                new Date(messages[index - 1].date_envoi).toDateString();
              
              return (
                <div key={message.id_message}>
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
                        {new Date(message.date_envoi).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                  
                  <MessageBubble
                    message={{
                      id: message.id_message.toString(),
                      text: message.contenu,
                      senderId: message.id_emetteur.toString(),
                      createdAt: new Date(message.date_envoi),
                      read: message.statut === 'seen',
                      senderName: sender?.fullName || (isOwn ? 'Vous' : 'Utilisateur'),
                      senderRole: sender?.role,
                      isOwn
                    }}
                    isOwn={isOwn}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t bg-white">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}