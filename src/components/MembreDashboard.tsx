import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Calendar, UserCheck, MessageSquare, LogOut, Plus, X, Edit, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { paymentService, Payment } from '../services/paymentService';
import { subscriptionService, Subscription } from '../services/subscriptionService';

type MembreView = 'profil' | 'seances' | 'historique' | 'absences' | 'messages';

interface Seance {
  id: string;
  sport: string;
  coach: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  capacite: number;
  inscrits: number;
  estInscrit?: boolean;
}

interface HistoriqueSeance {
  id: string;
  sport: string;
  coach: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  statut: 'presente' | 'absente';
}

interface Absence {
  id: string;
  sport: string;
  date: string;
  heureDebut: string;
  heureFin: string;
}

interface Message {
  id: string;
  expediteur: string;
  expediteurRole: string;
  contenu: string;
  date: string;
  reponses?: Message[];
}

export function MembreDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<MembreView>('profil');
  const [editMode, setEditMode] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showReplyMessage, setShowReplyMessage] = useState<string | null>(null);
  const [newMessageForm, setNewMessageForm] = useState({ destinataire: '', sujet: '', contenu: '' });
  const [replyContent, setReplyContent] = useState('');

  // Payment and Subscription state
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch payments and subscription when component mounts or when historique view is opened
  useEffect(() => {
    const loadPaymentsAndSubscription = async () => {
      if (currentView === 'historique' && user?.id) {
        setPaymentsLoading(true);
        setPaymentsError(null);
        try {
          console.log('Loading payments for user ID:', user.id);
          // Fetch payments for current user
          const userPayments = await paymentService.getByMember(user.id);
          console.log('Received payments:', userPayments);
          setPayments(userPayments);

          // Fetch all subscriptions to display alongside payments
          const subscriptions = await subscriptionService.getAll();
          console.log('Received subscriptions:', subscriptions);
          if (subscriptions.length > 0) {
            setCurrentSubscription(subscriptions[0]);
          }
        } catch (error: any) {
          console.error('Error loading payments:', error);
          setPaymentsError(error.message || 'Failed to load payment history');
        } finally {
          setPaymentsLoading(false);
        }
      }
    };

    loadPaymentsAndSubscription();
  }, [currentView, user?.id]);

  const [profileData, setProfileData] = useState({
    telephone: '0612345678',
    adresse: '15 rue du Sport, 75001 Paris',
    dateNaissance: '1990-05-15'
  });

  const [seances, setSeances] = useState<Seance[]>([
    { 
      id: '1', 
      sport: 'Football', 
      coach: 'Jean Martin',
      date: '2025-12-05', 
      heureDebut: '14:00', 
      heureFin: '16:00', 
      capacite: 20,
      inscrits: 15,
      estInscrit: true
    },
    { 
      id: '2', 
      sport: 'Basketball', 
      coach: 'Claire Dubois',
      date: '2025-12-06', 
      heureDebut: '10:00', 
      heureFin: '12:00', 
      capacite: 15,
      inscrits: 12,
      estInscrit: false
    },
    { 
      id: '3', 
      sport: 'Football', 
      coach: 'Jean Martin',
      date: '2025-12-07', 
      heureDebut: '16:00', 
      heureFin: '18:00', 
      capacite: 20,
      inscrits: 18,
      estInscrit: false
    },
    { 
      id: '4', 
      sport: 'Tennis', 
      coach: 'Marc Leroy',
      date: '2025-12-08', 
      heureDebut: '09:00', 
      heureFin: '11:00', 
      capacite: 8,
      inscrits: 5,
      estInscrit: true
    },
  ]);

  const historique: HistoriqueSeance[] = [
    { id: '1', sport: 'Football', coach: 'Jean Martin', date: '2025-11-28', heureDebut: '14:00', heureFin: '16:00', statut: 'presente' },
    { id: '2', sport: 'Tennis', coach: 'Marc Leroy', date: '2025-11-25', heureDebut: '09:00', heureFin: '11:00', statut: 'presente' },
    { id: '3', sport: 'Football', coach: 'Jean Martin', date: '2025-11-21', heureDebut: '14:00', heureFin: '16:00', statut: 'absente' },
    { id: '4', sport: 'Basketball', coach: 'Claire Dubois', date: '2025-11-18', heureDebut: '10:00', heureFin: '12:00', statut: 'presente' },
  ];

  const absences: Absence[] = historique
    .filter(h => h.statut === 'absente')
    .map(h => ({
      id: h.id,
      sport: h.sport,
      date: h.date,
      heureDebut: h.heureDebut,
      heureFin: h.heureFin
    }));

  const messages: Message[] = [
    {
      id: '1',
      expediteur: 'Jean Martin',
      expediteurRole: 'Coach',
      contenu: 'La séance de samedi aura lieu de 14h00 à 16h00 comme prévu. N\'oubliez pas votre équipement !',
      date: 'Il y a 2 heures'
    },
    {
      id: '2',
      expediteur: 'Admin - Super Admin',
      expediteurRole: 'Admin',
      contenu: 'Bienvenue au club ! N\'hésitez pas à nous contacter si vous avez des questions.',
      date: 'Hier'
    }
  ];

  const handleInscrireSeance = (seanceId: string) => {
    setSeances(seances.map(s => 
      s.id === seanceId 
        ? { ...s, estInscrit: true, inscrits: s.inscrits + 1 }
        : s
    ));
    alert('Vous êtes inscrit à cette séance !');
  };

  const handleDesinscrireSeance = (seanceId: string) => {
    if (confirm('Voulez-vous vraiment annuler votre inscription ?')) {
      setSeances(seances.map(s => 
        s.id === seanceId 
          ? { ...s, estInscrit: false, inscrits: s.inscrits - 1 }
          : s
      ));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditMode(false);
    alert('Profil mis à jour avec succès !');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewMessage(false);
    alert('Message envoyé avec succès !');
  };

  const handleReplyMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReplyMessage(null);
    alert('Réponse envoyée avec succès !');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-gray-900">Espace Membre</h1>
            <p className="text-gray-600">Bienvenue, {user.prenom} {user.nom}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
              <button
                onClick={() => setCurrentView('profil')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'profil'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserIcon className="w-5 h-5" />
                Mon profil
              </button>
              <button
                onClick={() => setCurrentView('seances')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'seances'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Séances disponibles
              </button>
              <button
                onClick={() => setCurrentView('historique')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'historique'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Historique
              </button>
              <button
                onClick={() => setCurrentView('absences')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'absences'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                Mes absences
              </button>
              <button
                onClick={() => setCurrentView('messages')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'messages'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                Messages
              </button>
            </div>
          </nav>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Profil View */}
            {currentView === 'profil' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-gray-900">Mon profil</h2>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                  )}
                </div>

                {editMode ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        value={user.nom}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        value={user.prenom}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={profileData.telephone}
                        onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Adresse</label>
                      <input
                        type="text"
                        value={profileData.adresse}
                        onChange={(e) => setProfileData({ ...profileData, adresse: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Date de naissance</label>
                      <input
                        type="date"
                        value={profileData.dateNaissance}
                        onChange={(e) => setProfileData({ ...profileData, dateNaissance: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500">Nom</p>
                      <p className="text-gray-900">{user.nom}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prénom</p>
                      <p className="text-gray-900">{user.prenom}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Téléphone</p>
                      <p className="text-gray-900">{profileData.telephone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Adresse</p>
                      <p className="text-gray-900">{profileData.adresse}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date de naissance</p>
                      <p className="text-gray-900">{profileData.dateNaissance}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Séances disponibles View */}
            {currentView === 'seances' && (
              <div className="space-y-6">
                <h2 className="text-gray-900">Séances disponibles</h2>

                <div className="space-y-4">
                  {seances.map(seance => (
                    <div key={seance.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-2">{seance.sport}</h3>
                          <div className="space-y-1 text-gray-600">
                            <p>Coach : {seance.coach}</p>
                            <p>Date : {seance.date}</p>
                            <p>Horaire : {seance.heureDebut} - {seance.heureFin}</p>
                            <p>Places : {seance.inscrits} / {seance.capacite}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {seance.estInscrit ? (
                            <>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                Inscrit
                              </span>
                              <button
                                onClick={() => handleDesinscrireSeance(seance.id)}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Annuler
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleInscrireSeance(seance.id)}
                              disabled={seance.inscrits >= seance.capacite}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                seance.inscrits >= seance.capacite
                                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                              {seance.inscrits >= seance.capacite ? 'Complet' : "S'inscrire"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historique View - Payments and Subscriptions */}
            {currentView === 'historique' && (
              <div className="space-y-6">
                <h2 className="text-gray-900">Historique - Paiements et Abonnements</h2>

                {/* Current Subscription Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Mon abonnement actuel</h3>
                  </div>

                  {currentSubscription ? (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-5 border border-indigo-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 mb-1">Type d'abonnement</p>
                          <p className="text-gray-900 font-semibold">{currentSubscription.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Prix</p>
                          <p className="text-gray-900 font-semibold">{currentSubscription.price}€</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Durée</p>
                          <p className="text-gray-900 font-semibold">{currentSubscription.duration} mois</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Status</p>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Actif</span>
                        </div>
                      </div>
                      {currentSubscription.description && (
                        <div className="mt-4 pt-4 border-t border-indigo-200">
                          <p className="text-gray-600 mb-1">Description</p>
                          <p className="text-gray-700">{currentSubscription.description}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-yellow-800">Aucun abonnement actif actuellement. Veuillez contacter l'administration.</p>
                    </div>
                  )}
                </div>

                {/* Payment History Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Historique des paiements</h3>
                  </div>

                  {paymentsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-600 mt-2">Chargement des paiements...</p>
                    </div>
                  ) : paymentsError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800">{paymentsError}</p>
                    </div>
                  ) : payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Date</th>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Montant</th>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Méthode</th>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4 text-gray-900">
                                {new Date(payment.paymentDate).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="px-4 py-4 text-gray-900 font-semibold">{payment.amount}€</td>
                              <td className="px-4 py-4 text-gray-600">
                                <span className="capitalize">
                                  {payment.method === 'cash' ? 'Espèces' : payment.method === 'card' ? 'Carte' : 'Virement'}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${
                                  payment.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {payment.status === 'paid' && <CheckCircle className="w-4 h-4" />}
                                  {payment.status === 'paid' ? 'Payé' : 'Annulé'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">Aucun paiement enregistré</p>
                    </div>
                  )}

                  {/* Payment Summary */}
                  {payments.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-600 text-sm mb-1">Total des paiements</p>
                          <p className="text-gray-900 text-2xl font-bold">
                            {payments.reduce((sum, p) => sum + p.amount, 0)}€
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-gray-600 text-sm mb-1">Paiements confirmés</p>
                          <p className="text-green-900 text-2xl font-bold">
                            {payments.filter(p => p.status === 'paid').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Absences View */}
            {currentView === 'absences' && (
              <div className="space-y-6">
                <h2 className="text-gray-900">Mes absences</h2>

                {absences.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="space-y-3">
                      {absences.map(absence => (
                        <div key={absence.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                          <h3 className="text-gray-900 mb-1">{absence.sport}</h3>
                          <p className="text-gray-600">{absence.date} - {absence.heureDebut} à {absence.heureFin}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-gray-700">
                        Vous avez {absences.length} absence{absences.length > 1 ? 's' : ''} enregistrée{absences.length > 1 ? 's' : ''}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-center text-gray-500 py-8">Aucune absence enregistrée</p>
                  </div>
                )}
              </div>
            )}

            {/* Messages View */}
            {currentView === 'messages' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-gray-900">Messagerie</h2>
                  <button
                    onClick={() => setShowNewMessage(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Nouveau message
                  </button>
                </div>

                {showNewMessage && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Destinataire</label>
                        <input
                          type="text"
                          value={newMessageForm.destinataire}
                          onChange={(e) => setNewMessageForm({ ...newMessageForm, destinataire: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Sujet</label>
                        <input
                          type="text"
                          value={newMessageForm.sujet}
                          onChange={(e) => setNewMessageForm({ ...newMessageForm, sujet: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Contenu</label>
                        <textarea
                          value={newMessageForm.contenu}
                          onChange={(e) => setNewMessageForm({ ...newMessageForm, contenu: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewMessage(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Envoyer
                        </button>
                      </div>
                    </form>
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
                        <button
                          onClick={() => setShowReplyMessage(message.id)}
                          className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          Répondre
                        </button>

                        {showReplyMessage === message.id && (
                          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                            <form onSubmit={handleReplyMessage} className="space-y-4">
                              <div>
                                <label className="block text-gray-700 mb-2">Contenu de la réponse</label>
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowReplyMessage(null)}
                                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                  Annuler
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                  Envoyer
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}