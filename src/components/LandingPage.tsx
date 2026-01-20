import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Trophy, Star, LogIn, MapPin, Phone, Mail, Clock, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReservationTerrain } from './ReservationTerrain';

export function LandingPage() {
  const [showReservation, setShowReservation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  if (showReservation) {
    return <ReservationTerrain />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-indigo-900">Club Sportif Excellence</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowReservation(true)}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Réserver un terrain
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Connexion
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section avec Animation */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}>
            <h2 className="text-indigo-900 mb-4">Bienvenue au Club Sportif Excellence</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Votre destination pour l'excellence sportive. Rejoignez notre communauté passionnée 
              et découvrez des installations de premier ordre avec des coachs professionnels.
            </p>
            <button
              onClick={() => setShowReservation(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Réserver votre créneau
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Image principale avec animation */}
          <div className={`transition-all duration-1000 delay-300 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1764438246710-83c535cada80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjbHViJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzY0NTE1NTIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Club sportif"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className={`transition-all duration-700 delay-500 transform ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}>
              <Users className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
              <p className="mb-2">500+</p>
              <p className="text-indigo-200">Membres actifs</p>
            </div>
            <div className={`transition-all duration-700 delay-600 transform ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}>
              <Trophy className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
              <p className="mb-2">15+</p>
              <p className="text-indigo-200">Coaches certifiés</p>
            </div>
            <div className={`transition-all duration-700 delay-700 transform ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}>
              <Calendar className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
              <p className="mb-2">100+</p>
              <p className="text-indigo-200">Séances par semaine</p>
            </div>
            <div className={`transition-all duration-700 delay-800 transform ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}>
              <Star className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
              <p className="mb-2">10+</p>
              <p className="text-indigo-200">Années d'expérience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports disponibles */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-gray-900 text-center mb-12">Nos Disciplines Sportives</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1734652246537-104c43a68942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHN0YWRpdW0lMjBmaWVsZHxlbnwxfHx8fDE3NjQ1MDI4Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Football"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-gray-900 mb-2">Football</h3>
                <p className="text-gray-600 mb-4">
                  Terrain aux normes professionnelles, séances d'entraînement pour tous niveaux.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                    Entraînements techniques
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                    Matchs amicaux
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                    Coaching personnalisé
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1710378844976-93a6538671ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwY291cnQlMjBpbmRvb3J8ZW58MXx8fHwxNzY0NDM1OTczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Basketball"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-gray-900 mb-2">Basketball</h3>
                <p className="text-gray-600 mb-4">
                  Salle couverte climatisée, équipements de qualité professionnelle.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                    Entraînements collectifs
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                    Perfectionnement individuel
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                    Tournois réguliers
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1750698544894-1f012e37e5e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwZ3ltJTIwd29ya291dHxlbnwxfHx8fDE3NjQ0MzIzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fitness"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-gray-900 mb-2">Fitness & Musculation</h3>
                <p className="text-gray-600 mb-4">
                  Espace fitness moderne avec équipements dernière génération.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                    Programmes personnalisés
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                    Cours collectifs
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                    Suivi nutritionnel
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-gray-900 mb-6">À propos du Club</h2>
              <p className="text-gray-600 mb-4">
                Fondé en 2015, le Club Sportif Excellence s'est imposé comme une référence 
                dans le domaine du sport amateur et professionnel. Nous croyons que le sport 
                est un vecteur de dépassement de soi et de cohésion sociale.
              </p>
              <p className="text-gray-600 mb-6">
                Nos installations modernes et nos coachs certifiés vous accompagnent dans 
                l'atteinte de vos objectifs, que vous soyez débutant ou athlète confirmé.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Trophy className="w-6 h-6 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-gray-900">Excellence & Performance</p>
                    <p className="text-gray-600">Des programmes adaptés à tous les niveaux</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-gray-900">Communauté Passionnée</p>
                    <p className="text-gray-600">Rejoignez une famille de sportifs motivés</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="w-6 h-6 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-gray-900">Qualité Garantie</p>
                    <p className="text-gray-600">Équipements et encadrement de premier ordre</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1764438246710-83c535cada80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjbHViJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzY0NTE1NTIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Club 1"
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1710378844976-93a6538671ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwY291cnQlMjBpbmRvb3J8ZW58MXx8fHwxNzY0NDM1OTczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Club 2"
                className="w-full h-48 object-cover rounded-lg shadow-md mt-8"
              />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1734652246537-104c43a68942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHN0YWRpdW0lMjBmaWVsZHxlbnwxfHx8fDE3NjQ1MDI4Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Club 3"
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1750698544894-1f012e37e5e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwZ3ltJTIwd29ya291dHxlbnwxfHx8fDE3NjQ0MzIzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Club 4"
                className="w-full h-48 object-cover rounded-lg shadow-md mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-gray-900 text-center mb-12">Contactez-nous</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <MapPin className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">Adresse</h3>
              <p className="text-gray-600">123 Avenue du Sport</p>
              <p className="text-gray-600">75001 Paris, France</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Phone className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">Téléphone</h3>
              <p className="text-gray-600">+33 1 23 45 67 89</p>
              <p className="text-gray-600">Lun-Sam: 8h-20h</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Mail className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">contact@clubsportif.fr</p>
              <p className="text-gray-600">info@clubsportif.fr</p>
            </div>
          </div>
        </div>
      </section>

      {/* Horaires */}
      <section className="py-16 px-4 bg-indigo-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Clock className="w-16 h-16 mx-auto mb-6 text-indigo-300" />
          <h2 className="text-white mb-8">Horaires d'ouverture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-800/50 rounded-lg p-6">
              <p className="mb-2">Lundi - Vendredi</p>
              <p className="text-indigo-200">6h00 - 22h00</p>
            </div>
            <div className="bg-indigo-800/50 rounded-lg p-6">
              <p className="mb-2">Samedi - Dimanche</p>
              <p className="text-indigo-200">8h00 - 20h00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-6 h-6 text-indigo-400" />
            <p className="text-gray-400">Club Sportif Excellence</p>
          </div>
          <p className="text-gray-400">© 2025 Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}