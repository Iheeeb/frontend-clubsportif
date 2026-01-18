import { useState, useEffect } from "react";
import { User } from '../../services/userService';
import { messageService, Conversation, Message } from '../../services/messageService';
import { Search, Users, MessageSquare, X, Send, Plus } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { MessageInput } from "./MessageInput";
import { TagMessageForm } from "./TagMessageForm";
import { socket } from "../../services/socket";


interface AdminChatViewProps {
  admin: User;
  membres: User[];
  coaches: User[];
  onSendMessage?: (recipientIds: number[], content: string) => void;
}

interface Recipient {
  type: 'user' | 'tag';
  id?: number;
  tag?: string;
  label: string;
}

const TAGS = [
  { tag: '@everyone', label: '@everyone', description: 'Tous les utilisateurs actifs' },
  { tag: '@coaches', label: '@coaches', description: 'Tous les coaches actifs' },
  { tag: '@members', label: '@members', description: 'Tous les membres actifs' },
];

export function AdminChatView({ admin, membres, coaches }: AdminChatViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSidebarTab, setActiveSidebarTab] = useState<'conversations' | 'users'>('conversations');
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  
  // Tous les utilisateurs disponibles
  const allUsers = [...membres, ...coaches, admin];
    // --- Realtime: réception des nouveaux messages ---
useEffect(() => {
  // Token (enlève "Bearer " si présent)
  const raw = localStorage.getItem("auth_token") || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

  console.log("[socket] token length", token.length);

  socket.auth = { token };
  if (!socket.connected) socket.connect();

  const onConnect = () => console.log("[socket] connected", socket.id);
  const onDisconnect = (reason: string) => console.log("[socket] disconnected", reason);
  const onConnectError = (err: any) => console.log("[socket] connect_error", err.message);

  const onIncomingMessage = (msg: Message) => {
    console.log("[socket] incoming", msg);

    // ignore si ça ne concerne pas l'admin
    if (msg.id_emetteur !== admin.id && msg.id_destinataire !== admin.id) return;

    const otherUserId =
      msg.id_emetteur === admin.id ? msg.id_destinataire : msg.id_emetteur;

    const conversationId = [admin.id, otherUserId].sort((a, b) => a - b).join("_");

    setConversations((prev) => {
      const existing = prev.find((c) => c.id === conversationId);

      if (!existing) {
        const otherUser = allUsers.find((u) => u.id === otherUserId);

        const newConv: Conversation = {
          id: conversationId,
          participants: [admin.id, otherUserId].sort((a, b) => a - b),
          participantNames: {
            [admin.id]: admin.fullName,
            [otherUserId]: otherUser?.fullName || `Utilisateur ${otherUserId}`,
          },
          participantRoles: {
            [admin.id]: admin.role,
            [otherUserId]: otherUser?.role || "USER",
          },
          messages: [msg],
          lastMessage: msg,
          unreadCount: msg.id_destinataire === admin.id ? 1 : 0,
          isGroup: false,
        };

        return [newConv, ...prev];
      }

      const updated: Conversation = {
        ...existing,
        messages: [...existing.messages, msg],
        lastMessage: msg,
        unreadCount:
          msg.id_destinataire === admin.id && selectedConversation?.id !== conversationId
            ? existing.unreadCount + 1
            : existing.unreadCount,
      };

      return [updated, ...prev.filter((c) => c.id !== conversationId)];
    });

    setSelectedConversation((prev) => {
      if (!prev) return prev;
      if (prev.id !== conversationId) return prev;

      return {
        ...prev,
        messages: [...prev.messages, msg],
        lastMessage: msg,
      };
    });
  };

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  socket.on("connect_error", onConnectError);

  // IMPORTANT: écouter les deux events
  socket.on("message:new", onIncomingMessage);
  socket.on("message:sent", onIncomingMessage);

  return () => {
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
    socket.off("connect_error", onConnectError);
    socket.off("message:new", onIncomingMessage);
    socket.off("message:sent", onIncomingMessage);
  };
}, [admin.id, admin.fullName, admin.role, allUsers, selectedConversation?.id]);


  // Charger les conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const convs = await messageService.getConversations(admin.id, allUsers);
        setConversations(convs);
      } catch (error) {
        console.error("Erreur chargement conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadConversations, 30000*10);
    return () => clearInterval(interval);
  }, [admin.id]);
  
  // Filtrer les utilisateurs pour la recherche
  const filteredUsers = searchQuery.trim() === "" 
    ? allUsers.filter(user => user.id !== admin.id)
    : allUsers.filter(user => {
        if (user.id === admin.id) return false;
        const query = searchQuery.toLowerCase();
        return (
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
        );
      });
  
  // Filtrer les conversations pour la recherche
  const filteredConversations = searchQuery.trim() === ""
    ? conversations
    : conversations.filter(conv => {
        const query = searchQuery.toLowerCase();
        return conv.participants.some(participantId => {
          if (participantId === admin.id) return false;
          const user = allUsers.find(u => u.id === participantId);
          return user?.fullName.toLowerCase().includes(query) || 
                 user?.email.toLowerCase().includes(query);
        });
      });
  
  // Démarrer une nouvelle conversation
  const handleStartConversation = async (userId: number) => {
    // Vérifier si conversation existe déjà
    const existingConv = conversations.find(conv => 
      conv.participants.includes(admin.id) && 
      conv.participants.includes(userId)
    );
    
    if (existingConv) {
      setSelectedConversation(existingConv);
      setShowNewMessageForm(false);
      return;
    }
    
    // Créer une conversation vide
    const otherUser = allUsers.find(u => u.id === userId);
    const participants = [admin.id, userId].sort((a, b) => a - b);
    
    const newConversation: Conversation = {
      id: participants.join('_'),
      participants,
      participantNames: {
        [admin.id]: admin.fullName,
        [userId]: otherUser?.fullName || `Utilisateur ${userId}`
      },
      participantRoles: {
        [admin.id]: admin.role,
        [userId]: otherUser?.role || 'USER'
      },
      messages: [],
      unreadCount: 0,
      isGroup: false
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setShowNewMessageForm(false);
  };
  
  // Envoyer un message dans une conversation
  const handleSendMessage = async (conversationId: string, content: string) => {
    if (!content.trim() || !selectedConversation) return;
    
    // Trouver l'autre participant
    const otherParticipantId = selectedConversation.participants.find(id => id !== admin.id);
    if (!otherParticipantId) return;
    
    try {
      // Envoyer le message
      const newMessage = await messageService.sendToUser({
        id_emetteur: admin.id,
        id_destinataire: otherParticipantId,
        contenu: content
      });
      
      // Mettre à jour la conversation localement
      const updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMessage],
        lastMessage: newMessage
      };
      
      setSelectedConversation(updatedConversation);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? updatedConversation : conv
        )
      );
      
    } catch (error) {
      console.error("Erreur envoi message:", error);
      alert("Erreur lors de l'envoi du message");
    }
  };
  
  // Envoyer un message avec tags
  const handleSendTagMessage = async (recipients: Recipient[], content: string) => {
    if (!content.trim() || recipients.length === 0) return;
    
    try {
      // Résoudre les tags en IDs utilisateurs
      const recipientIds: Set<number> = new Set();
      
      recipients.forEach(recipient => {
        if (recipient.type === 'user' && recipient.id) {
          recipientIds.add(recipient.id);
        } else if (recipient.type === 'tag') {
          switch (recipient.tag) {
            case '@everyone':
              allUsers.forEach(u => {
                if (u.status === 'ACTIVE' && u.id !== admin.id) recipientIds.add(u.id);
              });
              break;
            case '@coaches':
              coaches.forEach(c => {
                if (c.status === 'ACTIVE') recipientIds.add(c.id);
              });
              break;
            case '@members':
              membres.forEach(m => {
                if (m.status === 'ACTIVE') recipientIds.add(m.id);
              });
              break;
          }
        }
      });
      
      // Envoyer à tous les destinataires
      await messageService.sendToUsers({
        id_emetteur: admin.id,
        id_destinataires: Array.from(recipientIds),
        contenu: content
      });
      
      alert(`Message envoyé à ${recipientIds.size} destinataire(s)`);
      setShowNewMessageForm(false);
      
      // Recharger les conversations
      const convs = await messageService.getConversations(admin.id, allUsers);
      setConversations(convs);
      
    } catch (error) {
      console.error("Erreur envoi message avec tags:", error);
      alert("Erreur lors de l'envoi du message");
    }
  };
  
  // Obtenir le nom de l'autre participant
  const getOtherParticipantName = (conversation: Conversation) => {
    const otherId = conversation.participants.find(id => id !== admin.id);
    if (!otherId) return "Conversation de groupe";
    
    const user = allUsers.find(u => u.id === otherId);
    return user?.fullName || `Utilisateur ${otherId}`;
  };
  
  // Obtenir le rôle de l'autre participant
  const getOtherParticipantRole = (conversation: Conversation) => {
    const otherId = conversation.participants.find(id => id !== admin.id);
    if (!otherId) return "";
    
    const user = allUsers.find(u => u.id === otherId);
    return user?.role || "USER";
  };
  
  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Messagerie</h2>
          <button
            onClick={() => setShowNewMessageForm(!showNewMessageForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Nouveau message
          </button>
        </div>
      </div>
      
      {/* Formulaire d'envoi avec tags (affiché en haut) */}
      {showNewMessageForm && (
        <div className="p-6 border-b bg-gray-50">
          <TagMessageForm
            admin={admin}
            membres={membres}
            coaches={coaches}
            onSend={handleSendTagMessage}
            onCancel={() => setShowNewMessageForm(false)}
          />
        </div>
      )}
      
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div className="w-[26rem] lg:w-[30rem] border-r border-gray-200 flex flex-col ">
          {/* Recherche */}
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une conversation ou un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeSidebarTab === 'conversations' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveSidebarTab('conversations')}
            >
              <div className="flex justify-center items-center gap-2">
                <MessageSquare size={18} />
                <span>Conversations</span>
              </div>
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeSidebarTab === 'users' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveSidebarTab('users')}
            >
              <div className="flex justify-center items-center gap-2">
                <Users size={18} />
                <span>Utilisateurs</span>
              </div>
            </button>
          </div>
          
          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activeSidebarTab === 'conversations' ? (
              filteredConversations.length > 0 ? (
                <ul>
                  {filteredConversations.map(conversation => {
                    const otherName = getOtherParticipantName(conversation);
                    const otherRole = getOtherParticipantRole(conversation);
                    const lastMessage = conversation.lastMessage;
                    
                    return (
                      <li 
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-indigo-50' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                            otherRole === 'ADMIN' ? 'bg-red-100' :
                            otherRole === 'COACH' ? 'bg-green-100' :
                            'bg-blue-100'
                          }`}>
                            <span className={`font-semibold ${
                              otherRole === 'ADMIN' ? 'text-red-600' :
                              otherRole === 'COACH' ? 'text-green-600' :
                              'text-blue-600'
                            }`}>
                              {otherName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium truncate">{otherName}</h3>
                              {lastMessage && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatDate(lastMessage.date_envoi)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                otherRole === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                otherRole === 'COACH' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {otherRole}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {lastMessage?.contenu || "Aucun message"}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                  <MessageSquare size={48} className="mb-4 text-gray-300" />
                  <p className="font-medium mb-2">Aucune conversation</p>
                  <p className="text-sm">Commencez une nouvelle conversation</p>
                </div>
              )
            ) : (
              <ul>
                {filteredUsers.map(user => (
                  <li 
                    key={user.id}
                    className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleStartConversation(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        user.role === 'ADMIN' ? 'bg-red-100' :
                        user.role === 'COACH' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        <span className={`font-semibold ${
                          user.role === 'ADMIN' ? 'text-red-600' :
                          user.role === 'COACH' ? 'text-green-600' :
                          'text-blue-600'
                        }`}>
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{user.fullName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">{user.email}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'COACH' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {user.status === 'ACTIVE' ? (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              En ligne
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              Hors ligne
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Zone de chat */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUser={admin}
              allUsers={allUsers}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <div className="max-w-md">
                <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageSquare size={48} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-800">Bienvenue dans la messagerie</h3>
                <p className="text-gray-600 mb-6">
                  Sélectionnez une conversation existante ou démarrez-en une nouvelle avec un utilisateur
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => setActiveSidebarTab('users')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Voir les utilisateurs
                  </button>
                  <button 
                    onClick={() => setShowNewMessageForm(true)}
                    className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Envoyer un message groupé
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}