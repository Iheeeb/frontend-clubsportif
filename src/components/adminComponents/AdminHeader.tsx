import { LogOut } from 'lucide-react';

interface AdminHeaderProps {
  userName: string;
  onLogout: () => void;
}

export function AdminHeader({ userName, onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Tableau de bord Administrateur</h1>
          <p className="text-gray-600">Bienvenue, {userName}</p>
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