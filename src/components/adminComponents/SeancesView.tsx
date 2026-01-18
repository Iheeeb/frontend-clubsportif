import { useMemo, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

import { User } from '../../services/userService';
import { Session } from '../../services/sessionService';
import { Sport } from '../../services/sportService';
import { Room } from '../../services/roomService';

type Category = { id: number; sportId: number; label: string };

// (Optionnel) catégories encore statiques chez toi.
// Tu pourras aussi les rendre dynamiques plus tard si tu as un endpoint.
const mockCategories: Category[] = [
  { id: 1, sportId: 1, label: 'cadet' },
  { id: 2, sportId: 1, label: 'senior' },
  { id: 3, sportId: 2, label: 'cadet' },
  { id: 4, sportId: 2, label: 'senior' },
  { id: 5, sportId: 3, label: 'cadet' },
  { id: 6, sportId: 3, label: 'senior' },
];

interface SeancesViewProps {
  seances: Session[];
  coaches: User[];

  // DYNAMIQUE
  sports: Sport[];
  rooms: Room[];

  showAddSeance: boolean;
  seanceForm: {
    sessionDate: string;
    startTime: string;
    endTime: string;
    idCoach: string;
    idRoom: string;
    idTeam: string;
    sportId: string;
    categoryId: string;
  };

  isEditing: boolean;
  onToggleForm: () => void;
  onFormChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (seance: Session) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const a1 = timeToMinutes(aStart);
  const a2 = timeToMinutes(aEnd);
  const b1 = timeToMinutes(bStart);
  const b2 = timeToMinutes(bEnd);
  return a1 < b2 && b1 < a2;
}

export function SeancesView({
  seances,
  coaches,
  sports,
  rooms,
  showAddSeance,
  seanceForm,
  isEditing,
  onToggleForm,
  onFormChange,
  onSubmit,
  onEdit,
  onDelete,
  onCancel,
}: SeancesViewProps) {
  const [tab, setTab] = useState<'form' | 'agenda'>('form');

  const getCoachName = (idCoach?: number) => {
    if (!idCoach) return 'Non assigné';
    const coach = coaches.find(c => c.id === idCoach);
    return coach ? coach.fullName : 'Coach inconnu';
  };

  // Valeur sport par défaut: premier sport disponible, sinon "1"
  const effectiveSportId = useMemo(() => {
    if (seanceForm.sportId) return seanceForm.sportId;
    if (sports.length > 0) return String(sports[0].id);
    return '1';
  }, [seanceForm.sportId, sports]);

  const sportId = parseInt(effectiveSportId, 10);

  // Rooms dynamiques (backend: Room.idSport)
  const roomsForSport = useMemo(() => {
    return rooms.filter(r => r.idSport === sportId);
  }, [rooms, sportId]);

  // Catégories (encore statiques ici)
  const categoriesForSport = useMemo(() => {
    return mockCategories.filter(c => c.sportId === sportId);
  }, [sportId]);

  const agendaDate = useMemo(
    () => seanceForm.sessionDate || new Date().toISOString().slice(0, 10),
    [seanceForm.sessionDate]
  );

  const selectedRoomId = seanceForm.idRoom ? parseInt(seanceForm.idRoom, 10) : null;

  const agendaItems = useMemo(() => {
    if (!selectedRoomId) return [];
    return seances
      .filter(s => (s as any).idRoom === selectedRoomId)
      .filter(s => (s as any).sessionDate === agendaDate)
      .map(s => ({
        id: (s as any).id,
        startTime: (s as any).startTime,
        endTime: (s as any).endTime,
        coach: getCoachName((s as any).idCoach),
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [seances, selectedRoomId, agendaDate]);

  const conflictWarning = useMemo(() => {
    if (!seanceForm.sessionDate || !seanceForm.startTime || !seanceForm.endTime || !seanceForm.idRoom) {
      return null;
    }
    const roomId = parseInt(seanceForm.idRoom, 10);
    const sameDay = seances.filter(
      s => (s as any).idRoom === roomId && (s as any).sessionDate === seanceForm.sessionDate
    );
    const hasConflict = sameDay.some(s => overlaps(seanceForm.startTime, seanceForm.endTime, (s as any).startTime, (s as any).endTime));
    return hasConflict ? 'Conflit: ce terrain/salle est déjà réservé sur ce créneau.' : null;
  }, [seances, seanceForm, isEditing]);

  // Handler sport change (met aussi room/category par défaut)
  const handleSportChange = (newSportId: string) => {
    onFormChange('sportId', newSportId);

    const sid = parseInt(newSportId, 10);

    const firstRoom = rooms.find(r => r.idSport === sid);
    onFormChange('idRoom', firstRoom ? String(firstRoom.id) : '');

    const firstCat = mockCategories.find(c => c.sportId === sid);
    onFormChange('categoryId', firstCat ? String(firstCat.id) : '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des séances</h2>
          <p className="text-sm text-gray-500">Planification + consultation agenda terrain (par sport).</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('agenda')}
            className={`px-4 py-2 rounded-lg border ${tab === 'agenda' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
          >
            Agenda terrain
          </button>

          <button
            onClick={() => {
              setTab('form');
              onToggleForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            title="Créer une nouvelle séance"
          >
            <Plus className="w-5 h-5" />
            Créer une séance
          </button>
        </div>
      </div>

      {/* AGENDA */}
      {tab === 'agenda' && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
              <select
                value={effectiveSportId}
                onChange={e => handleSportChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sports.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terrain / Salle</label>
              <select
                value={seanceForm.idRoom}
                onChange={e => onFormChange('idRoom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choisir...</option>
                {roomsForSport.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={agendaDate}
                onChange={e => onFormChange('sessionDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Créneaux occupés</h3>

            {selectedRoomId ? (
              agendaItems.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune séance sur ce terrain à cette date.</p>
              ) : (
                <div className="space-y-2">
                  {agendaItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="text-gray-900 font-medium">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="text-sm text-gray-600">{item.coach}</div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Choisis un terrain/salle.</p>
            )}
          </div>
        </div>
      )}

      {/* FORM */}
      {showAddSeance && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{isEditing ? 'Modifier la séance' : 'Nouvelle séance'}</h3>

          {conflictWarning && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{conflictWarning}</div>
          )}

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={seanceForm.sessionDate}
                onChange={e => onFormChange('sessionDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
              <select
                value={seanceForm.idCoach}
                onChange={e => onFormChange('idCoach', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner un coach</option>
                {coaches.map(coach => (
                  <option key={coach.id} value={coach.id}>
                    {coach.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
              <input
                type="time"
                value={seanceForm.startTime}
                onChange={e => onFormChange('startTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
              <input
                type="time"
                value={seanceForm.endTime}
                onChange={e => onFormChange('endTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
              <select
                value={effectiveSportId}
                onChange={e => handleSportChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sports.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={seanceForm.categoryId}
                onChange={e => onFormChange('categoryId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categoriesForSport.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Terrain / Salle</label>
              <select
                value={seanceForm.idRoom}
                onChange={e => onFormChange('idRoom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Non assigné</option>
                {roomsForSport.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                disabled={!!conflictWarning}
                title={conflictWarning ? 'Conflit détecté' : 'Enregistrer'}
              >
                {isEditing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {seances.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            Aucune séance pour le moment. Créez-en une !
          </div>
        ) : (
          seances.map(seance => (
            <div key={(seance as any).id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Séance {(seance as any).id}</h3>
                    <span className="text-gray-600">avec {getCoachName((seance as any).idCoach)}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-gray-500 font-medium">Date</p>
                      <p>{new Date((seance as any).sessionDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Horaire</p>
                      <p>
                        {(seance as any).startTime} - {(seance as any).endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Salle/Terrain</p>
                      <p>#{(seance as any).idRoom}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    title="Modifier la séance"
                    onClick={() => onEdit(seance)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    title="Supprimer la séance"
                    onClick={() => onDelete((seance as any).id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default SeancesView;