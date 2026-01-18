import { useState } from 'react';
import { Message } from './CoachTypes';

interface MessagesViewProps {
  messages: Message[];
  onSendMessage: (message: Omit<Message, 'id' | 'date'>) => void;
  onReplyMessage: (messageId: string, reply: Omit<Message, 'id' | 'date'>) => void;
}

export function MessagesView({ messages, onSendMessage, onReplyMessage }: MessagesViewProps) {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showReplyMessage, setShowReplyMessage] = useState<string | null>(null);
  const [newMessageForm, setNewMessageForm] = useState({ destinataire: '', sujet: '', contenu: '' });
  const [replyContent, setReplyContent] = useState('');

  const handleSendMessage = () => {
    onSendMessage({
      expediteur: '', // Will be set in parent
      expediteurRole: 'Coach',
      contenu: newMessageForm.contenu,
    });
    setNewMessageForm({ destinataire: '', sujet: '', contenu: '' });
    setShowNewMessage(false);
  };

  const handleReplyMessage = (messageId: string) => {
    onReplyMessage(messageId, {
      expediteur: '', // Will be set in parent
      expediteurRole: 'Coach',
      contenu: replyContent,
    });
    setReplyContent('');
    setShowReplyMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-gray-900">Messagerie</h2>
        <button
          onClick={() => setShowNewMessage(!showNewMessage)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Nouveau message
        </button>
      </div>

      {showNewMessage && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-900 mb-4">Nouveau message</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Destinataire</label>
              <input
                type="text"
                value={newMessageForm.destinataire}
                onChange={(e) => setNewMessageForm({ ...newMessageForm, destinataire: e.target.value })}
                placeholder="Nom du destinataire"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Sujet</label>
              <input
                type="text"
                value={newMessageForm.sujet}
                onChange={(e) => setNewMessageForm({ ...newMessageForm, sujet: e.target.value })}
                placeholder="Sujet du message"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea
                value={newMessageForm.contenu}
                onChange={(e) => setNewMessageForm({ ...newMessageForm, contenu: e.target.value })}
                placeholder="Votre message..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Envoyer
              </button>
              <button
                onClick={() => setShowNewMessage(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-gray-900">{message.expediteur} ({message.expediteurRole})</p>
                  <p className="text-gray-500">{message.date}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                {message.contenu}
              </p>
              {message.reponses && message.reponses.length > 0 && (
                <div className="space-y-2 mb-3">
                  {message.reponses.map(reponse => (
                    <div key={reponse.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-900">{reponse.expediteur} ({reponse.expediteurRole})</p>
                      <p className="text-gray-700">{reponse.contenu}</p>
                      <p className="text-gray-500">{reponse.date}</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowReplyMessage(showReplyMessage === message.id ? null : message.id)}
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                Répondre
              </button>
              {showReplyMessage === message.id && (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Votre réponse..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReplyMessage(message.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Envoyer la réponse
                    </button>
                    <button
                      onClick={() => setShowReplyMessage(null)}
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
      </div>
    </div>
  );
}