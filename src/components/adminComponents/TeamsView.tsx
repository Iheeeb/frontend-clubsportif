// TeamsView.tsx
import { useMemo, useState } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Team, teamService } from '../../services/teamService';
import { User } from '../../services/userService';
import { Sport } from '../../services/sportService';

type Category = { id: number; sportId: number; label: string };

// Même pattern que SeancesView (catégories statiques)
const mockCategories: Category[] = [
  { id: 1, sportId: 1, label: 'cadet' },
  { id: 2, sportId: 1, label: 'senior' },
  { id: 3, sportId: 2, label: 'cadet' },
  { id: 4, sportId: 2, label: 'senior' },
  { id: 5, sportId: 3, label: 'cadet' },
  { id: 6, sportId: 3, label: 'senior' },
];

interface TeamsViewProps {
  teams: Team[];
  setTeams: (teams: Team[]) => void;

  coaches: User[];
  sports: Sport[]; // si vide, on fallback sportId=1

  // Optionnel: pour afficher un toast/loader global dans AdminDashboard si tu veux plus tard
}

export function TeamsView({ teams, setTeams, coaches, sports }: TeamsViewProps) {
  const [loading, setLoading] = useState(false);

  const defaultSportId = useMemo(() => {
    if (sports && sports.length > 0) return sports[0].id;
    return 1;
  }, [sports]);

  const [sportId, setSportId] = useState<number>(defaultSportId);
  const categoriesForSport = useMemo(
    () => mockCategories.filter(c => c.sportId === sportId),
    [sportId]
  );

  const [categoryId, setCategoryId] = useState<number>(
    categoriesForSport[0]?.id ?? 1
  );

  // Quand sport change -> reset catégorie
  const handleSportChange = (newSportId: number) => {
    setSportId(newSportId);
    const firstCat = mockCategories.find(c => c.sportId === newSportId);
    setCategoryId(firstCat?.id ?? 1);
  };

  const getSportName = (id?: number) => {
    if (!id) return '—';
    const s = sports?.find(sp => sp.id === id);
    return s ? s.name : `Sport #${id}`;
  };

  const getCategoryLabel = (id?: number) => {
    if (!id) return '—';
    const c = mockCategories.find(cat => cat.id === id);
    return c ? c.label : `Cat #${id}`;
  };

  const getCoachName = (id?: number) => {
    if (!id) return 'Non assigné';
    const coach = coaches.find(c => c.id === id);
    return coach ? coach.fullName : 'Coach inconnu';
  };

  const buildTeamName = (sportLabel: string, categoryLabel: string, num: number) => {
    // normalisation simple (espaces -> -, minuscule)
    const s = sportLabel.trim().toLowerCase().replace(/\s+/g, '-');
    const c = categoryLabel.trim().toLowerCase().replace(/\s+/g, '-');
    return `${s}-${c}-${num}`;
  };

  const refreshTeams = async () => {
    setLoading(true);
    try {
      const list = await teamService.getByCategory({ sportId, categoryId });
      setTeams(list);
    } catch (e) {
      console.error(e);
      alert("Erreur lors du chargement des équipes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    setLoading(true);
    try {
      const catLabel = getCategoryLabel(categoryId);
      const sportLabel = getSportName(sportId);

      const next = await teamService.getNextNumber({ sportId, categoryId });
      const name = buildTeamName(sportLabel, catLabel, next.nextNumber);

      const created = await teamService.create({
        name,
        id_sport: sportId,
        id_category: categoryId,
        // age_category: catLabel, // si tu veux garder un legacy
      });

      // refresh pour rester cohérent avec le backend
      const list = await teamService.getByCategory({ sportId, categoryId });
      setTeams(list);

      alert(`Équipe créée: ${created.name}`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la création de l'équipe");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm("Supprimer cette équipe ?")) return;
    setLoading(true);
    try {
      await teamService.delete(id);
      setTeams(teams.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCoach = async (team: Team, newCoachId: number | null) => {
    setLoading(true);
    try {
      const updated = await teamService.update(team.id, {
        id_coach: newCoachId ?? null ?? undefined,
      } as any);

      setTeams(teams.map(t => (t.id === updated.id ? updated : t)));
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la mise à jour du coach");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load simple: si aucune équipe chargée, on propose un refresh
  // (on évite useEffect ici pour ne pas déclencher des appels non désirés)
  const emptyHint = teams.length === 0;

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
            onClick={handleCreateTeam}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Créer équipe
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
          <select
            value={sportId}
            onChange={(e) => handleSportChange(parseInt(e.target.value, 10))}
            className="w-full border rounded-lg px-3 py-2"
          >
            {(sports?.length ? sports : [{ id: 1, name: 'Football' } as any]).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
            className="w-full border rounded-lg px-3 py-2"
          >
            {categoriesForSport.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
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

      {emptyHint && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg p-4">
          Aucune équipe chargée. Clique sur “Charger les équipes”.
        </div>
      )}

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
                <td className="px-4 py-3">{getSportName(team.sportId)}</td>
                <td className="px-4 py-3">{getCategoryLabel(team.categoryId)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={team.coachId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleChangeCoach(team, val ? parseInt(val, 10) : null);
                      }}
                      className="border rounded-lg px-2 py-1"
                    >
                      <option value="">Non assigné</option>
                      {coaches.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500">
                      ({getCoachName(team.coachId)})
                    </span>
                  </div>
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
