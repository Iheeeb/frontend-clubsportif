import { Plus, Edit, UserX, Trash2, CreditCard } from 'lucide-react';
import { User } from '../../services/userService';
import { Team } from '../../services/teamService';
import { MembreForm } from './MembreForm';

interface MembreFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_of_birth: string;
  adress: string;
  gender: string;
  medical_note: string;
  teamId: string; // NEW
}

interface MembresViewProps {
  membres: User[];
  teams: Team[]; // NEW: liste récupérée depuis la DB (GET /teams)

  showAddMembre: boolean;
  membreForm: MembreFormData;
  isEditing: boolean;

  onToggleForm: () => void;
  onFormChange: (field: keyof MembreFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;

  onEdit: (membre: User) => void;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;

  onGoToPayment: (membre: User) => void;
}

export function MembresView({
  membres,
  teams,
  showAddMembre,
  membreForm,
  isEditing,
  onToggleForm,
  onFormChange,
  onSubmit,
  onEdit,
  onToggleStatus,
  onDelete,
  onCancel,
  onGoToPayment,
}: MembresViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Membres</h2>

        <button
          onClick={onToggleForm}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Nouveau membre
        </button>
      </div>

      {showAddMembre && (
        <MembreForm
          formData={membreForm}
          isEditing={isEditing}
          onSubmit={onSubmit}
          onChange={onFormChange}
          onCancel={onCancel}
          teams={teams} // NEW
        />
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Nom</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Téléphone</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {membres.map((membre) => (
              <tr key={membre.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{membre.fullName}</td>
                <td className="px-4 py-3">{membre.email}</td>
                <td className="px-4 py-3">{membre.phone || '-'}</td>
                <td className="px-4 py-3">{membre.status === 'ACTIVE' ? 'Actif' : 'Inactif'}</td>

                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => onEdit(membre)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
                    >
                      <Edit className="w-4 h-4" />
                      Éditer
                    </button>

                    <button
                      onClick={() => onToggleStatus(membre.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-800"
                    >
                      <UserX className="w-4 h-4" />
                      {membre.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                    </button>

                    <button
                      onClick={() => onDelete(membre.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>

                    <button
                      onClick={() => onGoToPayment(membre)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CreditCard className="w-4 h-4" />
                      Paiement
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {membres.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                  Aucun membre pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
