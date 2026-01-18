import { Plus, Edit, UserX, Trash2, CreditCard } from 'lucide-react';
import { User } from '../../services/userService';
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
}

interface MembresViewProps {
  membres: User[];
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

  // NEW: encaisser depuis la liste
  onGoToPayment: (membre: User) => void;
}

export function MembresView({
  membres,
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des membres</h2>
        <button
          onClick={onToggleForm}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          title="Créer un nouveau membre"
        >
          <Plus className="w-5 h-5" />
          Ajouter un membre
        </button>
      </div>

      {showAddMembre && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {isEditing ? 'Modifier le membre' : 'Nouveau membre (créé désactivé)'}
          </h3>

          <MembreForm
  formData={membreForm}
  onChange={onFormChange}
  onSubmit={onSubmit}
  isEditing={isEditing}
  onCancel={onCancel}
/>

        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Nom</th>
              <th className="px-6 py-3 text-left text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-gray-700">Téléphone</th>
              <th className="px-6 py-3 text-left text-gray-700">Statut</th>
              <th className="px-6 py-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {membres.map((membre) => (
              <tr key={membre.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{membre.fullName}</td>
                <td className="px-6 py-4 text-gray-600">{membre.email}</td>
                <td className="px-6 py-4 text-gray-600">{membre.phone || '-'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      membre.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {membre.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      title="Encaisser paiement"
                      onClick={() => onGoToPayment(membre)}
                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>

                    <button
                      title="Modifier"
                      onClick={() => onEdit(membre)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      title={membre.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                      onClick={() => onToggleStatus(membre.id)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                    </button>

                    <button
                      title="Supprimer"
                      onClick={() => onDelete(membre.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {membres.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
