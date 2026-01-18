import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CoachHeader } from './coachComponents/CoachHeader';
import { CoachSidebar } from './coachComponents/CoachSidebar';
import { SeancesView } from './coachComponents/SeancesView';
import { AbsencesView } from './coachComponents/AbsencesView';
import { MessagesView } from './coachComponents/MessagesView';
import { CoachView, Seance, Membre, Absence, Message } from './coachComponents/CoachTypes';

export function CoachDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<CoachView>('seances');
  const [selectedSeance, setSelectedSeance] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock data
  const membres: Membre[] = [
    { id: '1', nom: 'Durand', prenom: 'Marie' },
    { id: '2', nom: 'Bernard', prenom: 'Paul' },
    { id: '3', nom: 'Petit', prenom: 'Sophie' },
    { id: '4', nom: 'Moreau', prenom: 'Lucas' },
    { id: '5', nom: 'Laurent', prenom: 'Emma' },
  ];

  const seances: Seance[] = [
    { 
      id: '1', 
      sport: 'Football', 
      date: '2025-12-05', 
      heureDebut: '14:00', 
      heureFin: '16:00', 
      capacite: 20,
      inscrits: ['1', '2', '3', '4']
    },
    { 
      id: '2', 
      sport: 'Football', 
      date: '2025-12-07', 
      heureDebut: '16:00', 
      heureFin: '18:00', 
      capacite: 20,
      inscrits: ['1', '2', '5']
    },
    { 
      id: '3', 
      sport: 'Football', 
      date: '2025-12-10', 
      heureDebut: '14:00', 
      heureFin: '16:00', 
      capacite: 20,
      inscrits: ['2', '3', '4', '5']
    },
  ];

  const [absences, setAbsences] = useState<Absence[]>([
    {
      id: '1',
      seanceId: '1',
      membreId: '2',
      membreNom: 'Paul Bernard',
      date: '2025-11-28',
      sport: 'Football',
      enregistrePar: user.prenom + ' ' + user.nom
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', expediteur: 'Admin - Super Admin', expediteurRole: 'Admin', contenu: 'Le matériel supplémentaire pour vendredi a été commandé. Il sera disponible jeudi.', date: 'Il y a 1 jour' },
    { id: '2', expediteur: 'Marie Durand', expediteurRole: 'Membre', contenu: 'Bonjour, pouvez-vous me confirmer l\'horaire de la séance de samedi ?', date: 'Il y a 3 jours' },
  ]);

  const handleMarquerAbsent = (seanceId: string, membreId: string) => {
    const seance = seances.find(s => s.id === seanceId);
    const membre = membres.find(m => m.id === membreId);
    
    if (seance && membre) {
      const newAbsence: Absence = {
        id: Date.now().toString(),
        seanceId,
        membreId,
        membreNom: `${membre.prenom} ${membre.nom}`,
        date: seance.date,
        sport: seance.sport,
        enregistrePar: `${user.prenom} ${user.nom}`
      };
      setAbsences([...absences, newAbsence]);
      alert(`${membre.prenom} ${membre.nom} a été marqué absent pour la séance du ${seance.date}`);
    }
  };

  const handleSendMessage = (message: Omit<Message, 'id' | 'date'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      expediteur: `${user.prenom} ${user.nom}`,
      date: 'Maintenant',
    };
    setMessages([...messages, newMessage]);
  };

  const handleReplyMessage = (messageId: string, reply: Omit<Message, 'id' | 'date'>) => {
    const newReply: Message = {
      ...reply,
      id: Date.now().toString(),
      expediteur: `${user.prenom} ${user.nom}`,
      date: 'Maintenant',
    };
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, reponses: [...(m.reponses || []), newReply] } : m
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <CoachSidebar currentView={currentView} onViewChange={setCurrentView} />

          <main className="lg:col-span-3">
            {currentView === 'seances' && (
              <SeancesView
                seances={seances}
                membres={membres}
                selectedSeance={selectedSeance}
                onSelectSeance={setSelectedSeance}
                onMarquerAbsent={handleMarquerAbsent}
              />
            )}

            {currentView === 'absences' && (
              <AbsencesView absences={absences} />
            )}

            {currentView === 'messages' && (
              <MessagesView
                messages={messages}
                onSendMessage={handleSendMessage}
                onReplyMessage={handleReplyMessage}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}