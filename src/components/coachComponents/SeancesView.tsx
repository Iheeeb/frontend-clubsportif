import { Users } from 'lucide-react';
import { Seance, Membre } from './CoachTypes';

interface SeancesViewProps {
  seances: Seance[];
  membres: Membre[];
  selectedSeance: string | null;
  onSelectSeance: (id: string | null) => void;
  onMarquerAbsent: (seanceId: string, membreId: string) => void;
}

export function SeancesView({ seances, membres, selectedSeance, onSelectSeance, onMarquerAbsent }: SeancesViewProps) {
  const getMembresBySeance = (seanceId: string) => {
    const seance = seances.find(s => s.id === seanceId);
    if (!seance) return [];
    return membres.filter(m => seance.inscrits.includes(m.id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-gray-900">Mon planning</h2>

      <div className="space-y-4">
        {seances.map(seance => (
          <div key={seance.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-900 mb-2">{seance.sport}</h3>
                  <div className="flex gap-4 text-gray-600">
                    <span>{seance.date}</span>
                    <span>{seance.heureDebut} - {seance.heureFin}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">{seance.inscrits.length} / {seance.capacite}</p>
                  <p className="text-gray-500">inscrits</p>
                </div>
              </div>

              <button
                onClick={() => onSelectSeance(selectedSeance === seance.id ? null : seance.id)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                {selectedSeance === seance.id ? 'Masquer les participants' : 'Voir les participants'}
              </button>
            </div>

            {selectedSeance === seance.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <h4 className="text-gray-900 mb-4">Participants inscrits</h4>
                <div className="space-y-2">
                  {getMembresBySeance(seance.id).map(membre => (
                    <div key={membre.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-900">{membre.prenom} {membre.nom}</span>
                      <button
                        onClick={() => onMarquerAbsent(seance.id, membre.id)}
                        className="px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        Marquer absent
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}