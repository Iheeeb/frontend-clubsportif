import {
  BarChart3,
  Users,
  UserCog,
  Calendar,
  MapPin,
  MessageSquare,
  Trophy,
  Layers,
  UsersRound,
  CreditCard,
} from 'lucide-react';

export type AdminView =
  | 'dashboard'
  | 'membres'
  | 'coaches'
  | 'seances'
  | 'reservations'
  | 'messages'
  | 'teams'
  | 'payments'
  | 'subscriptions';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

export function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard' as AdminView, icon: BarChart3, label: 'Tableau de bord', title: 'Voir le tableau de bord général' },
    { id: 'membres' as AdminView, icon: Users, label: 'Membres', title: 'Gérer les membres' },
    { id: 'coaches' as AdminView, icon: UserCog, label: 'Coaches', title: 'Gérer les coaches' },
    { id: 'seances' as AdminView, icon: Calendar, label: 'Séances', title: 'Gérer les séances' },

    // Bonus
    { id: 'reservations' as AdminView, icon: MapPin, label: 'Réservations Terrain', title: 'Gérer les réservations de terrain' },

    { id: 'messages' as AdminView, icon: MessageSquare, label: 'Messages', title: 'Notifications / Messagerie' },
    { id: 'teams' as AdminView, icon: UsersRound, label: 'Équipes', title: 'Créer et gérer les équipes' },
    { id: 'payments' as AdminView, icon: CreditCard, label: 'Paiements', title: 'Gérer les paiements' },
    { id: 'subscriptions' as AdminView, icon: Calendar, label: 'Abonnements', title: 'Gérer les abonnements' },
  ];

  return (
    <nav className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={item.title}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
