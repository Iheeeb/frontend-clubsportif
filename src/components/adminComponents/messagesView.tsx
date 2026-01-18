import { useState, useRef, useEffect ,useMemo} from 'react';
import { User } from '../../services/userService';

interface Message {
  id: string;
  expediteur: string;
  expediteurRole: string;
  contenu: string;
  date: string;
  reponses?: Message[];
}

interface Recipient {
  type: 'user' | 'tag';
  id?: number;
  tag?: string;
  label: string;
  email?: string;
  role?: string;
}

interface MessagesViewProps {
  messages: Message[];
  membres: User[];
  coaches: User[];
  admin: User;
  onSendMessage: (recipientIds: number[], contenu: string) => void;
  onReplyMessage: (messageId: string, contenu: string) => void;
}

const TAGS = [
  { tag: '@everyone', label: '@everyone', description: 'Tous les utilisateurs actifs' },
  { tag: '@coaches', label: '@coaches', description: 'Tous les coaches actifs' },
  { tag: '@members', label: '@members', description: 'Tous les membres actifs' },
  { tag: '@admin', label: '@admin', description: 'L\'administrateur' },
];

export function MessagesView({ 
  messages, 
  membres, 
  coaches, 
  admin,
  onSendMessage, 
  onReplyMessage 
}: MessagesViewProps) {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showReplyMessage, setShowReplyMessage] = useState<string | null>(null);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  
  // Pour la gestion des destinataires
  const [recipientInput, setRecipientInput] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [suggestions, setSuggestions] = useState<(User | { tag: string; label: string; description: string })[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tous les utilisateurs disponibles
const allUsers = useMemo(() => {
  return [...membres, ...coaches, admin];
}, [membres, coaches, admin]);

  // Filtrer les suggestions en fonction de l'input
  useEffect(() => {
    console.log("*****");
    console.log(messages);
    if (!recipientInput.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const input = recipientInput.toLowerCase().trim();

    // Si l'input commence par @, afficher les tags
    if (input.startsWith('@')) {
      const filteredTags = TAGS.filter(tag => 
        tag.tag.toLowerCase().includes(input)
      );
      setSuggestions(filteredTags);
      setShowSuggestions(filteredTags.length > 0);
      setActiveSuggestionIndex(0);
      return;
    }

    // Sinon, rechercher dans les utilisateurs actifs
    const filteredUsers = allUsers.filter(user => {
      if (user.status !== 'ACTIVE') return false;
      
      // Vérifier si l'utilisateur n'est pas déjà sélectionné
      const alreadySelected = selectedRecipients.some(
        r => r.type === 'user' && r.id === user.id
      );
      if (alreadySelected) return false;

      const fullName = user.fullName.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      
      return fullName.includes(input) || email.includes(input);
    });

    setSuggestions(filteredUsers);
    setShowSuggestions(filteredUsers.length > 0);
    setActiveSuggestionIndex(0);
  }, [recipientInput, selectedRecipients, allUsers]);

  // Ajouter un destinataire
  const addRecipient = (item: User | { tag: string; label: string; description: string }) => {
    if ('tag' in item) {
      // C'est un tag
      const alreadySelected = selectedRecipients.some(r => r.type === 'tag' && r.tag === item.tag);
      if (!alreadySelected) {
        setSelectedRecipients([...selectedRecipients, {
          type: 'tag',
          tag: item.tag,
          label: item.tag,
        }]);
      }
    } else {
      // C'est un utilisateur
      const alreadySelected = selectedRecipients.some(r => r.type === 'user' && r.id === item.id);
      if (!alreadySelected) {
        setSelectedRecipients([...selectedRecipients, {
          type: 'user',
          id: item.id,
          label: item.fullName,
          email: item.email,
          role: item.role,
        }]);
      }
    }
    
    setRecipientInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Supprimer un destinataire
  const removeRecipient = (index: number) => {
    setSelectedRecipients(selectedRecipients.filter((_, i) => i !== index));
  };

  // Résoudre les tags en IDs
  const resolveRecipients = (): number[] => {
    const ids: Set<number> = new Set();

    selectedRecipients.forEach(recipient => {
      if (recipient.type === 'user' && recipient.id) {
        ids.add(recipient.id);
      } else if (recipient.type === 'tag') {
        const activeUsers = allUsers.filter(u => u.status === 'ACTIVE');
        
        switch (recipient.tag) {
          case '@everyone':
            activeUsers.forEach(u => ids.add(u.id));
            break;
          case '@coaches':
            coaches.filter(c => c.status === 'ACTIVE').forEach(c => ids.add(c.id));
            break;
          case '@members':
            membres.filter(m => m.status === 'ACTIVE').forEach(m => ids.add(m.id));
            break;
          case '@admin':
            if (admin.status === 'ACTIVE') ids.add(admin.id);
            break;
        }
      }
    });

    return Array.from(ids);
  };

  // Envoyer le message
  const handleSendMessage = () => {
    if (newMessageContent.trim() && selectedRecipients.length > 0) {
      const recipientIds = resolveRecipients();
      
      if (recipientIds.length === 0) {
        alert('Aucun destinataire actif trouvé');
        return;
      }
      
      onSendMessage(recipientIds, newMessageContent);
      setNewMessageContent('');
      setSelectedRecipients([]);
      setRecipientInput('');
      setShowNewMessage(false);
    }
  };

  // Répondre à un message
  const handleReplyMessage = (messageId: string) => {
    if (replyContent.trim()) {
      onReplyMessage(messageId, replyContent);
      setReplyContent('');
      setShowReplyMessage(null);
    }
  };

  // Navigation au clavier dans les suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[activeSuggestionIndex]) {
        addRecipient(suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-gray-900 mb-6">Messagerie interne</h2>
      
      <div className="space-y-4">
        {messages.map(message => (
          <div key={message.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-gray-900">{message.expediteur} ({message.expediteurRole})</p>
                <p className="text-gray-500">{message.date}</p>
              </div>
              <button
                title="Répondre au message"
                onClick={() => setShowReplyMessage(message.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Répondre
              </button>
            </div>
            <p className="text-gray-700 mb-3">
              {message.contenu}
            </p>
            
            {message.reponses && message.reponses.length > 0 && (
              <div className="space-y-2">
                {message.reponses.map(reponse => (
                  <div key={reponse.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900">{reponse.expediteur} ({reponse.expediteurRole})</p>
                    <p className="text-gray-700">{reponse.contenu}</p>
                    <p className="text-gray-500">{reponse.date}</p>
                  </div>
                ))}
              </div>
            )}
            
            {showReplyMessage === message.id && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Votre réponse..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReplyMessage(message.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Envoyer
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyMessage(null);
                      setReplyContent('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        title="Créer un nouveau message"
        onClick={() => setShowNewMessage(!showNewMessage)}
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Nouveau message
      </button>

      {showNewMessage && (
        <div className="mt-4 space-y-4">
          {/* Champ destinataires avec auto-complétion */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinataires
            </label>
            
            {/* Zone avec badges des destinataires sélectionnés */}
            <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 flex flex-wrap gap-2 items-center">
              {selectedRecipients.map((recipient, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                >
                  <span>{recipient.label}</span>
                  <button
                    onClick={() => removeRecipient(index)}
                    className="hover:bg-indigo-200 rounded-full p-0.5"
                    type="button"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
              
              <input
                ref={inputRef}
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedRecipients.length === 0 ? "Tapez un nom, email ou @tag..." : ""}
                className="flex-1 min-w-[200px] outline-none"
              />
            </div>

            {/* Liste des suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((item, index) => {
                  if ('tag' in item) {
                    // Affichage des tags
                    return (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => addRecipient(item)}
                        className={`w-full text-left px-4 py-3 hover:bg-indigo-50 ${
                          index === activeSuggestionIndex ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="font-medium text-indigo-600">{item.label}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </button>
                    );
                  } else {
                    // Affichage des utilisateurs
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addRecipient(item)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                          index === activeSuggestionIndex ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{item.fullName}</div>
                        <div className="text-sm text-gray-500">{item.email}</div>
                        <div className="text-xs text-gray-400 uppercase">{item.role}</div>
                      </button>
                    );
                  }
                })}
              </div>
            )}
          </div>

          {/* Champ contenu du message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
              placeholder="Contenu du message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2">
            <button
              onClick={handleSendMessage}
              disabled={selectedRecipients.length === 0 || !newMessageContent.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Envoyer
            </button>
            <button
              onClick={() => {
                setShowNewMessage(false);
                setNewMessageContent('');
                setSelectedRecipients([]);
                setRecipientInput('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}