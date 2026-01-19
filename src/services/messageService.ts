import { apiService } from './apiService';

export interface Message {
  id_message: number;
  id_emetteur: number;
  id_destinataire: number;
  contenu: string;
  statut: 'sent' | 'seen';
  can_reply: boolean;
  id_messageRepondu?: number;
  date_envoi: string;
  emetteur_nom?: string;
  emetteur_role?: string;
  destinataire_nom?: string;
  reponses?: Message[];
}

export interface CreateMessageRequest {
  id_emetteur: number;
  id_destinataires: number[];  
  contenu: string;
  statut?: 'sent' | 'seen';
  can_reply?: boolean;
  id_messageRepondu?: number;
}

export interface UpdateMessageRequest extends Partial<CreateMessageRequest> {
  statut?: 'sent' | 'seen';
  can_reply?: boolean;
}

// Interface pour les conversations virtuelles côté frontend
export interface Conversation {
  id: string;
  participants: number[];
  participantNames: { [userId: number]: string };
  participantRoles: { [userId: number]: string };
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
}

export class MessageService {
  async getAll(userId?: number): Promise<Message[]> {
    console.log("Fetching messages for user:", userId);
    
    // Récupérer tous les messages
    const allMessages = await apiService.get<Message[]>('/messages');
    
    // Si userId est fourni, filtrer les messages pertinents
    if (userId) {
      return allMessages.filter(msg => 
        msg.id_emetteur === userId || msg.id_destinataire === userId
      );
    }
    
    return allMessages;
  }

  async getById(id: number): Promise<Message> {
    return apiService.get<Message>(`/messages/${id}`);
  }

  // Get messages between two users
  async getMessages(userId1: number, userId2: number): Promise<Message[]> {
    const allMessages = await this.getAll(userId1);
    return allMessages.filter(msg => 
      (msg.id_emetteur === userId1 && msg.id_destinataire === userId2) ||
      (msg.id_emetteur === userId2 && msg.id_destinataire === userId1)
    );
  }

  // Envoyer un message à un destinataire unique
  async sendToUser(data: {
    id_emetteur: number;
    id_destinataire: number;
    contenu: string;
  }): Promise<Message> {
    return apiService.post<Message>('/messages', {
      ...data,
      id_destinataires: [data.id_destinataire]
    });
  }

  // Envoyer à plusieurs destinataires (pour les tags)
  async sendToUsers(data: {
    id_emetteur: number;
    id_destinataires: number[];
    contenu: string;
  }): Promise<Message[]> {
    // Créer un message par destinataire
    const promises = data.id_destinataires.map(destId =>
      this.sendToUser({
        id_emetteur: data.id_emetteur,
        id_destinataire: destId,
        contenu: data.contenu
      })
    );
    
    return Promise.all(promises);
  }

  async create(data: CreateMessageRequest): Promise<Message> {
    // Pour compatibilité avec l'ancien code
    if (data.id_destinataires.length === 1) {
      return this.sendToUser({
        id_emetteur: data.id_emetteur,
        id_destinataire: data.id_destinataires[0],
        contenu: data.contenu
      });
    } else {
      // Si plusieurs destinataires, créer plusieurs messages
      const messages = await this.sendToUsers(data);
      return messages[0]; // Retourne le premier pour compatibilité
    }
  }

  async update(id: number, data: UpdateMessageRequest): Promise<Message> {
    return apiService.put<Message>(`/messages/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/messages/${id}`);
  }

  // Marquer un message comme vu
  async markAsSeen(messageId: number): Promise<Message> {
    return this.update(messageId, { statut: 'seen' });
  }

  // Récupérer les conversations d'un utilisateur
  async getConversations(userId: number, allUsers: any[]): Promise<Conversation[]> {
    const messages = await this.getAll(userId);
    return this.groupMessagesIntoConversations(messages, userId, allUsers);
  }

  // Grouper les messages en conversations
  private groupMessagesIntoConversations(
    messages: Message[], 
    currentUserId: number, 
    allUsers: any[]
  ): Conversation[] {
    const conversationsMap = new Map<string, Conversation>();
    
    // Trier les messages par date
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.date_envoi).getTime() - new Date(b.date_envoi).getTime()
    );
    
    for (const message of sortedMessages) {
      // Identifier l'autre participant
      const otherUserId = message.id_emetteur === currentUserId 
        ? message.id_destinataire 
        : message.id_emetteur;
      
      // Créer un ID de conversation stable (toujours trié)
      const participants = [currentUserId, otherUserId].sort((a, b) => a - b);
      const conversationId = participants.join('_');
      
      // Récupérer ou créer la conversation
      let conversation = conversationsMap.get(conversationId);
      
      if (!conversation) {
        const otherUser = allUsers.find(u => u.id === otherUserId);
        
        conversation = {
          id: conversationId,
          participants,
          participantNames: {
            [currentUserId]: allUsers.find(u => u.id === currentUserId)?.fullName || 'Vous',
            [otherUserId]: otherUser?.fullName || `Utilisateur ${otherUserId}`
          },
          participantRoles: {
            [currentUserId]: allUsers.find(u => u.id === currentUserId)?.role || 'USER',
            [otherUserId]: otherUser?.role || 'USER'
          },
          messages: [],
          unreadCount: 0,
          isGroup: false
        };
        conversationsMap.set(conversationId, conversation);
      }
      
      // Ajouter le message
      conversation.messages.push(message);
      
      // Mettre à jour le dernier message
      conversation.lastMessage = message;
      
      // Compter les messages non lus
      if (message.statut === 'sent' && message.id_emetteur !== currentUserId) {
        conversation.unreadCount++;
      }
    }
    
    // Convertir la Map en tableau et trier par date du dernier message
    return Array.from(conversationsMap.values())
      .sort((a, b) => {
        if (!a.lastMessage || !b.lastMessage) return 0;
        return new Date(b.lastMessage.date_envoi).getTime() - 
               new Date(a.lastMessage.date_envoi).getTime();
      });
  }
}

export const messageService = new MessageService();