import { useState, useEffect } from "react";
import { User } from '../services/userService';
import { messageService, Message } from '../services/messageService';
import { MessageSquare, Send, Search } from "lucide-react";

interface MemberChatViewProps {
  member: User;
  coaches: User[];
  admin: User;
  teamMembers: User[];
}

interface ChatSession {
  userId: number;
  messages: Message[];
}

export function MemberChatView({ member, coaches, admin, teamMembers }: MemberChatViewProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatSessions, setChatSessions] = useState<Map<number, Message[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");

  // All available users: admin, coaches, and team members
  const allUsers = admin ? [admin, ...coaches, ...teamMembers] : [...coaches, ...teamMembers];

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
      // Sort messages by date
      const sortedMessages = convMessages.sort((a, b) => 
        new Date(a.date_envoi || a.createdAt || '').getTime() - 
        new Date(b.date_envoi || b.createdAt || '').getTime()
      );
      setMessages(sortedMessages);
      
      // Cache the messages
      setChatSessions(prev => new Map(prev).set(user.id, convMessages));
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filterUsers = (users: User[]) => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter(user => 
      user.fullName.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  };

  // Group users by role for better organization
  const groupedUsers = {
    admin: admin ? filterUsers([admin]) : [],
    coaches: filterUsers(coaches),
    members: filterUsers(teamMembers)
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedUser) return;

    setSendingMessage(true);
    try {
      const sentMessage = await messageService.create({
        id_emetteur: member.id,
        id_destinataires: [selectedUser.id],
        contenu: messageContent,
      });

      // Add message to local state - use the sent message from server or create a temporary one
      const newMessage: Message = sentMessage || {
        id_message: Date.now(),
        id_emetteur: member.id,
        id_destinataire: selectedUser.id,
        contenu: messageContent,
        statut: 'sent',
        can_reply: true,
        date_envoi: new Date().toISOString(),
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Update cache
      setChatSessions(prev => new Map(prev).set(selectedUser.id, updatedMessages));
      
      // Reload messages to get the latest from server
      const refreshedMessages = await messageService.getMessages(member.id, selectedUser.id);
      const sortedRefreshed = refreshedMessages.sort((a, b) => 
        new Date(a.date_envoi || a.createdAt || '').getTime() - 
        new Date(b.date_envoi || b.createdAt || '').getTime()
      );
      setMessages(sortedRefreshed);
      setChatSessions(prev => new Map(prev).set(selectedUser.id, sortedRefreshed));

      setMessageContent("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200" style={{ width: '1000px', height: '700px' }}>
      {/* Sidebar - List of contacts */}
      <div className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col" style={{ width: '288px' }}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h3 className="text-sm font-bold text-white mb-3">Contacts</h3>
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {allUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun contact disponible</p>
            </div>
          ) : (groupedUsers.admin.length === 0 && groupedUsers.coaches.length === 0 && groupedUsers.members.length === 0) ? (
            <div className="p-6 text-center text-gray-400">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun résultat trouvé</p>
              <p className="text-xs mt-1">Essayez avec un autre terme de recherche</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Admin Section */}
              {groupedUsers.admin.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Administrateur
                  </div>
                  {groupedUsers.admin.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => loadMessagesWithUser(user)}
                        className={`w-full px-4 py-3 text-left transition-all duration-200 border-b border-gray-100 ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate text-sm">{user.fullName}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{user.role}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Coaches Section */}
              {groupedUsers.coaches.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Entraîneurs ({groupedUsers.coaches.length})
                  </div>
                  {groupedUsers.coaches.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => loadMessagesWithUser(user)}
                        className={`w-full px-4 py-3 text-left transition-all duration-200 border-b border-gray-100 ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate text-sm">{user.fullName}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{user.role}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Team Members Section */}
              {groupedUsers.members.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Membres d'équipe ({groupedUsers.members.length})
                  </div>
                  {groupedUsers.members.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => loadMessagesWithUser(user)}
                        className={`w-full px-4 py-3 text-left transition-all duration-200 border-b border-gray-100 ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate text-sm">{user.fullName}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{user.role}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div>
                <div className="font-semibold text-white text-base">{selectedUser.fullName}</div>
                <div className="text-xs text-blue-100 uppercase tracking-wider">{selectedUser.role}</div>
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
                messages.map((msg) => {
                  const messageDate = msg.date_envoi || msg.createdAt || '';
                  return (
                    <div
                      key={msg.id_message || msg.id}
                      className={`flex ${
                        msg.id_emetteur === member.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-xl shadow-sm ${
                          msg.id_emetteur === member.id
                            ? "bg-blue-200 text-gray-900 rounded-br-none border border-blue-400"
                            : "bg-blue-100 text-gray-900 rounded-bl-none border border-blue-300"
                        }`}
                      >
                        <p className="text-sm leading-relaxed text-gray-900">{msg.contenu}</p>
                        <span className={`text-xs mt-2 block ${
                          msg.id_emetteur === member.id ? "text-gray-700" : "text-gray-700"
                        }`}>
                          {new Date(messageDate).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                  disabled={sendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendingMessage}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
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
              <p className="text-sm text-gray-400 mt-2">Choisissez un contact pour commencer une conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
