import { useState, useRef, useEffect } from 'react';
import { User } from '../../services/userService';

interface Recipient {
  type: 'user' | 'tag';
  id?: number;
  tag?: string;
  label: string;
}

interface TagMessageFormProps {
  admin: User;
  membres: User[];
  coaches: User[];
  onSend: (recipients: Recipient[], content: string) => void;
  onCancel: () => void;
}

const TAGS = [
  { tag: '@everyone', label: '@everyone', description: 'Tous les utilisateurs actifs' },
  { tag: '@coaches', label: '@coaches', description: 'Tous les coaches actifs' },
  { tag: '@members', label: '@members', description: 'Tous les membres actifs' },
];

export function TagMessageForm({ admin, membres, coaches, onSend, onCancel }: TagMessageFormProps) {
  const [content, setContent] = useState('');
  const [recipientInput, setRecipientInput] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [suggestions, setSuggestions] = useState<(User | { tag: string; label: string; description: string })[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const allUsers = [...membres, ...coaches, admin];
  
  // Filtrer les suggestions
  useEffect(() => {
    if (!recipientInput.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const input = recipientInput.toLowerCase().trim();
    
    // Tags
    if (input.startsWith('@')) {
      const filteredTags = TAGS.filter(tag => 
        tag.tag.toLowerCase().includes(input)
      );
      setSuggestions(filteredTags);
      setShowSuggestions(filteredTags.length > 0);
      setActiveSuggestionIndex(0);
      return;
    }
    
    // Utilisateurs actifs
    const filteredUsers = allUsers.filter(user => {
      if (user.id === admin.id || user.status !== 'ACTIVE') return false;
      
      const alreadySelected = selectedRecipients.some(
        r => r.type === 'user' && r.id === user.id
      );
      if (alreadySelected) return false;
      
      const fullName = user.fullName.toLowerCase();
      const email = user.email.toLowerCase();
      
      return fullName.includes(input) || email.includes(input);
    });
    
    setSuggestions(filteredUsers);
    setShowSuggestions(filteredUsers.length > 0);
    setActiveSuggestionIndex(0);
  }, [recipientInput, selectedRecipients]);
  
  // Ajouter un destinataire
  const addRecipient = (item: User | { tag: string; label: string; description: string }) => {
    if ('tag' in item) {
      const alreadySelected = selectedRecipients.some(r => r.type === 'tag' && r.tag === item.tag);
      if (!alreadySelected) {
        setSelectedRecipients([...selectedRecipients, {
          type: 'tag',
          tag: item.tag,
          label: item.tag,
        }]);
      }
    } else {
      const alreadySelected = selectedRecipients.some(r => r.type === 'user' && r.id === item.id);
      if (!alreadySelected) {
        setSelectedRecipients([...selectedRecipients, {
          type: 'user',
          id: item.id,
          label: item.fullName,
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
  
  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[activeSuggestionIndex]) {
        addRecipient(suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && selectedRecipients.length > 0) {
      onSend(selectedRecipients, content);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinataires
        </label>
        
        <div className="relative">
          <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 flex flex-wrap gap-2 items-center">
            {selectedRecipients.map((recipient, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
              >
                <span>{recipient.label}</span>
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
                  className="hover:bg-indigo-200 rounded-full p-0.5"
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
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((item, index) => {
                if ('tag' in item) {
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
                  const roleColor = item.role === 'ADMIN' ? 'text-red-600' :
                                 item.role === 'COACH' ? 'text-green-600' : 'text-blue-600';
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
                      <div className={`text-xs uppercase ${roleColor}`}>{item.role}</div>
                    </button>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contenu du message..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
          required
        />
      </div>
      
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={selectedRecipients.length === 0 || !content.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Envoyer le message
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}