// TeamsView.tsx
import { useMemo, useState } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

import { Team, teamService } from '../../services/teamService';
import { User } from '../../services/userService';
import { Sport } from '../../services/sportService';

// Données statiques (slug = valeur stockée en DB et envoyée au backend)
const SPORTS = [
  { slug: 'football', label: 'Football' },
  { slug: 'handball', label: 'Handball' },
  { slug: 'basketball', label: 'Basketball' },
  { slug: 'volleyball', label: 'Volleyball' },
  { slug: 'tennis', label: 'Tennis' },
  { slug: 'padel', label: 'Padel' },
];

type StaticCategory = {
  sportSlug: string;
  label: string;      // affichage
  slug: string;       // valeur DB/backend (souvent label en minuscule)
};

const CATEGORIES: StaticCategory[] = [
  { sportSlug: 'football', label: 'Ecole', slug: 'ecole' },
  { sportSlug: 'football', label: 'Poussin', slug: 'poussin' },
  { sportSlug: 'football', label: 'Minime', slug: 'minime' },
  { sportSlug: 'football', label: 'Cadet', slug: 'cadet' },
  { sportSlug: 'football', label: 'Junior', slug: 'junior' },
  { sportSlug: 'football', label: 'Senior', slug: 'senior' },

  { sportSlug: 'handball', label: 'Ecole', slug: 'ecole' },
  { sportSlug: 'handball', label: 'Poussin', slug: 'poussin' },
  { sportSlug: 'handball', label: 'Minime', slug: 'minime' },
  { sportSlug: 'handball', label: 'Cadet', slug: 'cadet' },
  { sportSlug: 'handball', label: 'Junior', slug: 'junior' },
  { sportSlug: 'handball', label: 'Senior', slug: 'senior' },

  { sportSlug: 'basketball', label: 'Ecole', slug: 'ecole' },
  { sportSlug: 'basketball', label: 'Poussin', slug: 'poussin' },
  { sportSlug: 'basketball', label: 'Minime', slug: 'minime' },
  { sportSlug: 'basketball', label: 'Cadet', slug: 'cadet' },
  { sportSlug: 'basketball', label: 'Junior', slug: 'junior' },
  { sportSlug: 'basketball', label: 'Senior', slug: 'senior' },
];

interface TeamsViewProps {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  coaches: User[];
  sports: Sport[]; // pas utilisé ici mais gardé pour compatibilité avec ton props actuel
}

export function TeamsView({ teams, setTeams, coaches }: TeamsViewProps) {
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);

  // Nouveau filtre (strings)
  const [sport, setSport] = useState<string>(SPORTS[0].slug);
  const categoriesForSport = useMemo(
    () => CATEGORIES.filter(c => c.sportSlug === sport),
    [sport]
  );
  const [categorie, setCategorie] = useState<string>(categoriesForSport[0]?.slug ?? 'ecole');

  // Quand sport change -> reset categorie
  const handleSportChange = (newSport: string) => {
    setSport(newSport);
    const first = CATEGORIES.find(c => c.sportSlug === newSport);
    setCategorie(first?.slug ?? 'ecole');
  };

  const getSportLabel = (slug?: string) => {
    if (!slug) return '—';
    return SPORTS.find(s => s.slug === slug)?.label ?? slug;
  };

  const getCategoryLabel = (slug?: string) => {
    if (!slug) return '—';
    return CATEGORIES.find(c => c.slug === slug)?.label ?? slug;
  };

  const getCoachesForSport = (sportSlug: string) => {
    // même logique que ton code actuel: speciality contient le nom du sport
    return coaches.filter(coach => {
      if (!coach.speciality) return false;
      return coach.speciality.toLowerCase().includes(sportSlug);
    });
  };

  const coachesForCurrentSport = useMemo(
    () => getCoachesForSport(sport),
    [sport, coaches]
  );

  const buildTeamName = (sportSlug: string, categorieSlug: string, num: number) => {
    return `${sportSlug}-${categorieSlug}-${num}`;
  };

  const refreshTeams = async () => {
    setLoading(true);
    try {
      const list = await teamService.getByCategory({ sport, categorie });
      setTeams(list);
    } catch (e: any) {
      alert('Erreur lors du chargement des équipes: ' + (e?.response?.data?.message || e?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    setLoading(true);
    try {
      const next = await teamService.getNextNumber({ sport, categorie });
      const name = buildTeamName(sport, categorie, next.nextNumber);

      const created = await teamService.create({
        name,
        sport,
        categorie,
        id_coach: selectedCoachId || null,
      });

      // refresh
      const list = await teamService.getByCategory({ sport, categorie });
      setTeams(list);

      setShowCreateForm(false);
      setSelectedCoachId(null);
      alert(`Équipe créée: ${created.name}`);
    } catch (e: any) {
      alert("Erreur lors de la création de l'équipe: " + (e?.response?.data?.message || e?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm('Supprimer cette équipe ?')) return;
    setLoading(true);
    try {
      await teamService.delete(id);
      setTeams(teams.filter(t => t.id !== id));
    } catch (e: any) {
      alert('Erreur lors de la suppression: ' + (e?.response?.data?.message || e?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCoach = async (team: Team, newCoachId: number | null) => {
    setLoading(true);
    try {
      const updated = await teamService.update(team.id, { id_coach: newCoachId });
      setTeams(teams.map(t => (t.id === updated.id ? updated : t)));
    } catch (e: any) {
      alert('Erreur lors de la mise à jour du coach: ' + (e?.response?.data?.message || e?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Équipes</h2>
          <p className="text-sm text-gray-600">Nom auto: sport-categorie-numero.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshTeams}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>

          <button
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Créer équipe
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Créer une nouvelle équipe</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
              <select
                value={sport}
                onChange={(e) => handleSportChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {SPORTS.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {categoriesForSport.map((c) => (
                  <option key={`${c.sportSlug}-${c.slug}`} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coach (optionnel)</label>
              <select
                value={selectedCoachId ?? ''}
                onChange={(e) => setSelectedCoachId(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Non assigné</option>
                {coachesForCurrentSport.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
              {coachesForCurrentSport.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Aucun coach pour ce sport</p>
              )}
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleCreateTeam}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                Créer
              </button>
              <button
                onClick={() => { setShowCreateForm(false); setSelectedCoachId(null); }}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Annuler
              </button>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            Nom généré:{' '}
            <span className="font-mono font-semibold">
              {buildTeamName(sport, categorie, 0).replace('-0', '-X')}
            </span>{' '}
            <em>(X = numéro auto-incrémenté)</em>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
          <select
            value={sport}
            onChange={(e) => handleSportChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {SPORTS.map((s) => (
              <option key={s.slug} value={s.slug}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {categoriesForSport.map((c) => (
              <option key={`${c.sportSlug}-${c.slug}`} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg border p-4 flex items-end">
          <button
            onClick={refreshTeams}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
          >
            Charger les équipes
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Nom</th>
              <th className="text-left px-4 py-3">Sport</th>
              <th className="text-left px-4 py-3">Catégorie</th>
              <th className="text-left px-4 py-3">Coach</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{team.name}</td>
                <td className="px-4 py-3">{getSportLabel(team.sport)}</td>
                <td className="px-4 py-3">{getCategoryLabel(team.categorie)}</td>

                <td className="px-4 py-3">
                  <select
                    value={team.coachId ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChangeCoach(team, val ? parseInt(val, 10) : null);
                    }}
                    className="border rounded-lg px-2 py-1 w-full"
                  >
                    <option value="">Non assigné</option>
                    {getCoachesForSport(team.sport).map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}

            {teams.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                  Aucune équipe pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
