interface CoachFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adress: string;
  gender: string;
  specialty: string;
  diploma: string;
  experience_years: number;
}

interface CoachFormProps {
  formData: CoachFormData;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof CoachFormData, value: string) => void;
  onCancel: () => void;
}

export function CoachForm({ formData, isEditing, onSubmit, onChange, onCancel }: CoachFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-gray-900 mb-4">{isEditing ? 'Modifier le coach' : 'Nouveau coach'}</h3>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={(e) => onChange('nom', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={formData.prenom}
          onChange={(e) => onChange('prenom', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          name="address"
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
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
          <option value="OTHER">Autre</option>
        </select>
        <input
          type="text"
          name="specialty"
          placeholder="spécialité"
          value={formData.specialty}
          onChange={(e) => onChange('specialty', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        /> 
        <input
          type="number"
          name="Année_experience"
          placeholder="Années d'expérience"
          value={formData.experience_years}
          onChange={(e) => onChange('experience_years', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {isEditing ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
}