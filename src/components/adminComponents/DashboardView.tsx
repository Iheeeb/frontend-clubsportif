import { Users, UserCog, Calendar, CreditCard, Trophy } from 'lucide-react';
import { User } from '../../services/userService';

interface ReservationTerrain {
  id: string;
  nom: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  statut: 'en_attente' | 'acceptee' | 'refusee';
}
interface Seance { id: string; }

interface DashboardViewProps {
  membres: User[];
  coaches: User[];
  seances: Seance[];
  reservations: ReservationTerrain[];
}

type Plan = { id: number; type: string; durationMonths: number; price: number };
type Payment = { id: number; memberId: number; subscriptionId: number; amount: number; paymentDate: string; status: 'paid' | 'pending' | 'canceled' };

const mockPlans: Plan[] = [
  { id: 1, type: '1 mois', durationMonths: 1, price: 100 },
  { id: 2, type: '3 mois', durationMonths: 3, price: 250 },
];

const mockPayments: Payment[] = [
  { id: 1, memberId: 6, subscriptionId: 2, amount: 250, paymentDate: '2025-12-01', status: 'paid' },
  { id: 2, memberId: 9, subscriptionId: 1, amount: 100, paymentDate: '2025-12-10', status: 'paid' },
];

function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) d.setDate(0);
  return d.toISOString().slice(0, 10);
}

export function DashboardView({ membres = [], coaches = [], seances = [], reservations = [] }: DashboardViewProps) {
  const activeMembers = (membres || []).filter(m => m.status === 'ACTIVE').length;

  // Stat financière simple (mois courant)
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const paidThisMonth = mockPayments
    .filter(p => p.status === 'paid' && p.paymentDate.startsWith(monthPrefix))
    .reduce((sum, p) => sum + p.amount, 0);

  // Suivi adhésions (approximatif: dernier paiement paid + duration)
  const lastPaidByMember = new Map<number, Payment>();
  mockPayments
    .filter(p => p.status === 'paid')
    .forEach(p => {
      const existing = lastPaidByMember.get(p.memberId);
      if (!existing || p.paymentDate > existing.paymentDate) lastPaidByMember.set(p.memberId, p);
    });

  const today = new Date().toISOString().slice(0, 10);
  const expiringSoonLimit = new Date();
  expiringSoonLimit.setDate(expiringSoonLimit.getDate() + 7);

  const membersExpiringSoon = Array.from(lastPaidByMember.values())
    .map(p => {
      const plan = mockPlans.find(pl => pl.id === p.subscriptionId);
      const endDate = plan ? addMonths(p.paymentDate, plan.durationMonths) : p.paymentDate;
      return { memberId: p.memberId, endDate, planLabel: plan?.type || 'Abonnement' };
    })
    .filter(x => {
      const end = new Date(x.endDate);
      return x.endDate >= today && end <= expiringSoonLimit;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Membres actifs</p>
              <p className="text-2xl font-bold text-gray-900">{activeMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <UserCog className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Coaches</p>
              <p className="text-2xl font-bold text-gray-900">{coaches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Séances à venir</p>
              <p className="text-2xl font-bold text-gray-900">{seances.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Paiements (mois)</p>
              <p className="text-2xl font-bold text-gray-900">{paidThisMonth.toFixed(2)} DT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Adhésions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Suivi des adhésions</h3>
        </div>

        {membersExpiringSoon.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun abonnement n’expire dans les 7 prochains jours (données statiques).</p>
        ) : (
          <div className="space-y-2">
            {membersExpiringSoon.map(row => {
              const m = membres.find(mm => mm.id === row.memberId);
              return (
                <div key={row.memberId} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{m?.fullName || `Membre #${row.memberId}`}</div>
                    <div className="text-xs text-gray-500">{row.planLabel}</div>
                  </div>
                  <div className="text-sm text-gray-700">Expire le {row.endDate}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Réservations en attente (bonus) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Réservations de terrain en attente</h3>
        {reservations.filter(r => r.statut === 'en_attente').length > 0 ? (
          <div className="space-y-3">
            {reservations
              .filter(r => r.statut === 'en_attente')
              .slice(0, 5)
              .map(reservation => (
                <div key={reservation.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{reservation.nom}</p>
                    <p className="text-sm text-gray-500">
                      {reservation.date} - {reservation.heureDebut} à {reservation.heureFin}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">En attente</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucune réservation en attente</p>
        )}
      </div>
    </div>
  );
}
