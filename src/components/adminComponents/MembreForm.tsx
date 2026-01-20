import React from 'react';
import { Team } from '../../services/teamService';

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

interface MembreFormProps {
  formData: MembreFormData;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof MembreFormData, value: string) => void;
  onCancel: () => void;

  teams: Team[]; // NEW
}

export function MembreForm({ formData, isEditing, onSubmit, onChange, onCancel, teams }: MembreFormProps) {
  const teamMissing = !formData.teamId;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-gray-900 mb-4">
        {isEditing ? 'Modifier le membre' : 'Nouveau membre'}
      </h3>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Équipe obligatoire */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Équipe *</label>
          <select
            name="teamId"
            value={formData.teamId}
            onChange={(e) => onChange('teamId', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Sélectionner une équipe</option>
            {teams.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>

          {teamMissing && (
            <p className="text-xs text-red-600 mt-1">Veuillez sélectionner une équipe.</p>
          )}
        </div>

        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={(e) => onChange('nom', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={formData.prenom}
          onChange={(e) => onChange('prenom', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          type="tel"
          name="telephone"
          placeholder="Téléphone"
          value={formData.telephone}
          onChange={(e) => onChange('telephone', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="text"
          name="adress"
          placeholder="Adresse"
          value={formData.adress}
          onChange={(e) => onChange('adress', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={(e) => onChange('gender', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Sélectionner le genre</option>
          <option value="male">Masculin</option>
          <option value="female">Féminin</option>
          <option value="other">Autre</option>
        </select>

        <input
          type="date"
          name="date_of_birth"
          placeholder="Date de naissance"
          value={formData.date_of_birth}
          onChange={(e) => onChange('date_of_birth', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <textarea
          name="medical_note"
          placeholder="Note médicale (optionnel)"
          value={formData.medical_note}
          onChange={(e) => onChange('medical_note', e.target.value)}
          rows={3}
          className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="md:col-span-2 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={!formData.teamId}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {isEditing ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
}
