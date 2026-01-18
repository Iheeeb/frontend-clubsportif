import { useState, useEffect } from "react";
import { User } from '../services/userService';
import { messageService, Message } from '../services/messageService';
import { Search, MessageSquare, Send } from "lucide-react";

interface MemberChatViewProps {
  member: User;
  coaches: User[];
  admin: User;
}

interface ChatSession {
  userId: number;
  messages: Message[];
}

export function MemberChatView({ member, coaches, admin }: MemberChatViewProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatSessions, setChatSessions] = useState<Map<number, Message[]>>(new Map());

  // All available users (coaches and admin)
  const allUsers = [...coaches, admin];

  // Load messages for a specific user
  const loadMessagesWithUser = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);

    // Check if we already have messages cached
    if (chatSessions.has(user.id)) {
      setMessages(chatSessions.get(user.id) || []);
      setLoading(false);
      return;
    }

    try {
      // Fetch messages between member and this user
      const convMessages = await messageService.getMessages(member.id, user.id);
      setMessages(convMessages);
      
      // Cache the messages
      setChatSessions(prev => new Map(prev).set(user.id, convMessages));
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = allUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send message
  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedUser) return;

    setSendingMessage(true);
    try {
      await messageService.create({
        id_emetteur: member.id,
        id_destinataire: selectedUser.id,
        contenu: messageContent,
      });

      // Add message to local state
      const newMessage: Message = {
        id: Date.now().toString(),
        id_emetteur: member.id,
        id_destinataire: selectedUser.id,
        contenu: messageContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Update cache
      setChatSessions(prev => new Map(prev).set(selectedUser.id, updatedMessages));

      setMessageContent("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
<div className="flex h-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200">
      {/* Sidebar - List of all coaches and admin */}
<div className="w-64 min-w-[16rem] max-w-[16rem] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-2 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h3 className="text-xs font-bold text-white truncate">Messages</h3>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-1.5 top-2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Chercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-md text-xs"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageSquare size={24} className="mx-auto mb-1 opacity-30" />
              <p className="text-xs">Aucun</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              const hasMessages = chatSessions.has(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => loadMessagesWithUser(user)}
                 className="w-full px-2 py-2 text-left transition-all duration-200 border-b border-gray-100 hover:bg-blue-50"
                >
                  <div className="font-semibold text-gray-900 truncate text-xs">{user.fullName}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{user.role}</div>
                  {hasMessages && (
                    <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      {chatSessions.get(user.id)?.length || 0} msgs
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="px-3 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedUser.fullName}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{selectedUser.role}</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
              {loading ? (
                <div className="text-center text-gray-400 py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-sm">Chargement des messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 py-16">
                  <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun message</p>
                  <p className="text-xs mt-1">Commencez une conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.id_emetteur === member.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-xl shadow-sm ${
                        msg.id_emetteur === member.id
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.contenu}</p>
                      <span className={`text-xs mt-2 block opacity-70 ${
                        msg.id_emetteur === member.id ? "text-blue-100" : "text-gray-600"
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                  disabled={sendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendingMessage}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <MessageSquare size={56} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-500">Sélectionnez un contact</p>
              <p className="text-sm text-gray-400 mt-2">Choisissez un entraîneur ou l'admin pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
