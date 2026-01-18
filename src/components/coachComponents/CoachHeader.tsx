import { LogOut } from 'lucide-react';
import { User } from '../../store/authStore';

interface CoachHeaderProps {
  user: User;
  onLogout: () => void;
}

export function CoachHeader({ user, onLogout }: CoachHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Tableau de bord Coach</h1>
          <p className="text-gray-600">Bienvenue, {user.prenom} {user.nom}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </header>
  );
}