import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface Disponibilite {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  disponible: boolean;
}

interface Reservation {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  statut: 'en_attente' | 'acceptee' | 'refusee';
}

export function ReservationTerrain() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'disponibilites' | 'reserver' | 'statut'>('disponibilites');
  const [selectedDate, setSelectedDate] = useState('2025-12-01');
  const [email, setEmail] = useState('');
  
  // Mock data - disponibilités
  const disponibilites: Disponibilite[] = [
    { id: '1', date: '2025-12-01', heureDebut: '09:00', heureFin: '11:00', disponible: true },
    { id: '2', date: '2025-12-01', heureDebut: '11:00', heureFin: '13:00', disponible: false },
    { id: '3', date: '2025-12-01', heureDebut: '14:00', heureFin: '16:00', disponible: true },
    { id: '4', date: '2025-12-01', heureDebut: '16:00', heureFin: '18:00', disponible: true },
    { id: '5', date: '2025-12-02', heureDebut: '09:00', heureFin: '11:00', disponible: true },
    { id: '6', date: '2025-12-02', heureDebut: '14:00', heureFin: '16:00', disponible: false },
  ];

  // Mock data - réservations
  const [reservations, setReservations] = useState<Reservation[]>([
    { 
      id: '1', 
      nom: 'Dupont', 
      email: 'dupont@email.com', 
      telephone: '0612345678',
      date: '2025-12-05', 
      heureDebut: '14:00', 
      heureFin: '16:00', 
      statut: 'acceptee' 
    },
  ]);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    date: '',
    heureDebut: '',
    heureFin: '',
  });

  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const newReservation: Reservation = {
      id: Date.now().toString(),
      nom: formData.nom,
      email: formData.email,
      telephone: formData.telephone,
      date: formData.date,
      heureDebut: formData.heureDebut,
      heureFin: formData.heureFin,
      statut: 'en_attente',
    };
    setReservations([...reservations, newReservation]);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      date: '',
      heureDebut: '',
      heureFin: '',
    });
    alert('Votre demande de réservation a été envoyée avec succès !');
    setActiveTab('statut');
    setEmail(formData.email);
  };

  const filteredDisponibilites = disponibilites.filter(d => d.date === selectedDate);
  const userReservations = reservations.filter(r => r.email === email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </button>
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-indigo-900">Réservation de Terrain</h1>
              <p className="text-gray-600">Consultez les disponibilités et réservez votre créneau</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-2 flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('disponibilites')}
            className={`flex-1 py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'disponibilites'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Disponibilités
          </button>
          <button
            onClick={() => setActiveTab('reserver')}
            className={`flex-1 py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'reserver'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-5 h-5" />
            Réserver
          </button>
          <button
            onClick={() => setActiveTab('statut')}
            className={`flex-1 py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'statut'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Mes Réservations
          </button>
        </div>

        {/* Content */}
        <div>
          {/* Disponibilités */}
          {activeTab === 'disponibilites' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-900 mb-6">Disponibilités du terrain</h3>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Sélectionner une date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDisponibilites.map((dispo) => (
                  <div
                    key={dispo.id}
                    className={`p-4 rounded-lg border-2 ${
                      dispo.disponible
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-700" />
                        <span className="text-gray-900">
                          {dispo.heureDebut} - {dispo.heureFin}
                        </span>
                      </div>
                      {dispo.disponible ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <p className={`${dispo.disponible ? 'text-green-700' : 'text-red-700'}`}>
                      {dispo.disponible ? 'Disponible' : 'Réservé'}
                    </p>
                  </div>
                ))}
              </div>

              {filteredDisponibilites.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Aucune disponibilité pour cette date
                </p>
              )}
            </div>
          )}

          {/* Formulaire de réservation */}
          {activeTab === 'reserver' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-900 mb-6">Demander une réservation</h3>
              
              <form onSubmit={handleSubmitReservation} className="max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Heure de début *</label>
                    <input
                      type="time"
                      required
                      value={formData.heureDebut}
                      onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Heure de fin *</label>
                    <input
                      type="time"
                      required
                      value={formData.heureFin}
                      onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Envoyer la demande
                </button>
              </form>
            </div>
          )}

          {/* Statut des réservations */}
          {activeTab === 'statut' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-900 mb-6">Consulter le statut de vos réservations</h3>
              
              <div className="mb-6 max-w-md">
                <label className="block text-gray-700 mb-2">Entrez votre email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {email && userReservations.length > 0 && (
                <div className="space-y-4">
                  {userReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-gray-900">
                            {reservation.nom} - {reservation.date}
                          </p>
                          <p className="text-gray-600">
                            {reservation.heureDebut} - {reservation.heureFin}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full ${
                            reservation.statut === 'acceptee'
                              ? 'bg-green-100 text-green-800'
                              : reservation.statut === 'refusee'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {reservation.statut === 'acceptee'
                            ? 'Acceptée'
                            : reservation.statut === 'refusee'
                            ? 'Refusée'
                            : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {email && userReservations.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Aucune réservation trouvée pour cet email
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
