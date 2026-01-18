import { Plus, Edit, UserX, Trash2 } from 'lucide-react';
import { User } from '../../services/userService';
import { CoachForm } from './CoachForm';
import { useEffect } from 'react';

interface CoachFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  gender: string;
  medical_note: string;
  specialty: string;
  diploma: string;
  experience_years: number;
}

interface CoachesViewProps {
  coaches: User[];
  showAddCoach: boolean;
  coachForm: CoachFormData;
  isEditing: boolean;
  onToggleForm: () => void;
  onFormChange: (field: keyof CoachFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (coach: User) => void;
  onToggleStatus: (id: number) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export function CoachesView({
  coaches,
  showAddCoach,
  coachForm,
  isEditing,
  onToggleForm,
  onFormChange,
  onSubmit,
  onEdit,
  onToggleStatus,
  onDelete,
  onCancel
}: CoachesViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-gray-900">Gestion des coaches</h2>
        <button
          onClick={onToggleForm}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          title="Ajouter un nouveau coach"
        >
          <Plus className="w-5 h-5" />
          Ajouter un coach
        </button>
      </div>

      {showAddCoach && (
        <CoachForm
          formData={coachForm}
          isEditing={isEditing}
          onSubmit={onSubmit}
          onChange={onFormChange}
          onCancel={onCancel}
        />
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
            {coaches.map(membre => (
              <tr key={membre.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{membre.fullName}</td>
                <td className="px-6 py-4 text-gray-600">{membre.email}</td>
                <td className="px-6 py-4 text-gray-600">{membre.phone || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full ${
                    membre.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {membre.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      title="Modifier le  coach"
                      onClick={() => onEdit(membre)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      title="Changer le statut du coach"
                      onClick={() => onToggleStatus(membre.id)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                    <button 
                      title="Supprimer le coach"
                      onClick={() => onDelete(membre.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}