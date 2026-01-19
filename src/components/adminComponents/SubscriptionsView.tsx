import { useEffect, useMemo, useState } from 'react';
import { User } from '../../services/userService';
import { Payment, paymentService } from '../../services/paymentService';
import { AlertCircle, Calendar } from 'lucide-react';

type SubscriptionPlan = { id: number; type: string; price: number; durationMonths: number };

const PLANS: SubscriptionPlan[] = [
  { id: 1, type: 'Mensuel', price: 9.99, durationMonths: 1 },
  { id: 2, type: '3 Mois', price: 24.99, durationMonths: 3 },
  { id: 3, type: '6 Mois', price: 44.99, durationMonths: 6 },
  { id: 4, type: 'Annuel', price: 79.99, durationMonths: 12 },
];

function addMonths(dateStr: string, months: number) {
  // Parsing manuel pour éviter les problèmes de timezone
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day); // month - 1 car Date() utilise 0-11
  const dd = new Date(d.getFullYear(), d.getMonth() + months, d.getDate());
  return `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`;
}

interface MemberSubscription {
  member: User;
  lastPaymentDate: string | null;
  expirationDate: string | null;
  planType: string;
  daysUntilExpiry: number | null;
  isExpiringSoon: boolean;
}

interface SubscriptionsViewProps {
  membres: User[];
}

export function SubscriptionsView({ membres }: SubscriptionsViewProps) {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const list = await paymentService.getAll();
      setPayments(list);
    } catch (e) {
      console.error(e);
      alert('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const memberSubscriptions = useMemo(() => {
    const now = new Date();
    
    console.log('DEBUG SubscriptionsView - Payments loaded:', payments.length, payments);
    console.log('DEBUG SubscriptionsView - Membres loaded:', membres.length);
    
    // Pour chaque membre, calculer la date d'expiration en accumulant les paiements
    const memberExpirationMap = new Map<number, { expirationDate: string; planType: string; lastPaymentDate: string }>();
    
    // Grouper les paiements "paid" par membre
    const paymentsByMember = new Map<number, Payment[]>();
    for (const p of payments) {
      if (p.status !== 'paid') continue;
      if (!paymentsByMember.has(p.memberId)) {
        paymentsByMember.set(p.memberId, []);
      }
      paymentsByMember.get(p.memberId)!.push(p);
    }
    
    // Pour chaque membre, accumuler les durées des paiements
    for (const [memberId, memberPayments] of paymentsByMember) {
      // Trier par date de paiement (ascendant)
      memberPayments.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
      
      let currentExpirationDate: string | null = null;
      let lastPaymentDate = '';
      let planTypes: string[] = [];
      
      for (const payment of memberPayments) {
        const plan = PLANS.find(pl => pl.id === payment.subscriptionId);
        if (plan) {
          planTypes.push(plan.type);
          lastPaymentDate = payment.paymentDate;
          
          // Si c'est le premier paiement, initialiser avec la date de paiement
          if (currentExpirationDate === null) {
            currentExpirationDate = payment.paymentDate;
          }
          
          // Ajouter la durée en mois à partir de la date d'expiration précédente
          currentExpirationDate = addMonths(currentExpirationDate, plan.durationMonths);
        }
      }
      
      const expirationStr = currentExpirationDate || null;
      memberExpirationMap.set(memberId, {
        expirationDate: expirationStr || '-',
        planType: planTypes[planTypes.length - 1] || '-', // Affiche le type du dernier paiement
        lastPaymentDate,
      });
    }
    
    console.log('DEBUG - memberExpirationMap:', memberExpirationMap);

    const subs: MemberSubscription[] = membres.map((member) => {
      const expInfo = memberExpirationMap.get(member.id);
      
      if (!expInfo) {
        return {
          member,
          lastPaymentDate: null,
          expirationDate: null,
          planType: '-',
          daysUntilExpiry: null,
          isExpiringSoon: false,
        };
      }

      const expEnd = new Date(expInfo.expirationDate);
      const nowStr = now.toISOString().slice(0, 10); // Format YYYY-MM-DD
      
      // Calcul manuel des jours pour éviter les problèmes de timezone
      const [expYear, expMonth, expDay] = expInfo.expirationDate.split('-').map(Number);
      const [nowYear, nowMonth, nowDay] = nowStr.split('-').map(Number);
      
      const expDate = new Date(expYear, expMonth - 1, expDay);
      const nowDate = new Date(nowYear, nowMonth - 1, nowDay);
      
      const daysUntilExpiry = Math.floor((expDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
      const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
      const isExpired = daysUntilExpiry < 0;

      return {
        member,
        lastPaymentDate: expInfo.lastPaymentDate,
        expirationDate: expInfo.expirationDate,
        planType: expInfo.planType,
        daysUntilExpiry,
        isExpiringSoon: isExpiringSoon && !isExpired,
      };
    });

    // Trier: d'abord les expirant bientôt, puis les actifs, puis les inactifs
    subs.sort((a, b) => {
      // Les expirant bientôt d'abord
      if (a.isExpiringSoon && !b.isExpiringSoon) return -1;
      if (!a.isExpiringSoon && b.isExpiringSoon) return 1;
      
      // Les inactifs en dernier
      if (a.member.status === 'INACTIVE' && b.member.status !== 'INACTIVE') return 1;
      if (a.member.status !== 'INACTIVE' && b.member.status === 'INACTIVE') return -1;

      // Sinon, trier par daysUntilExpiry (ascendant)
      const aDays = a.daysUntilExpiry ?? Infinity;
      const bDays = b.daysUntilExpiry ?? Infinity;
      return aDays - bDays;
    });

    return subs;
  }, [membres, payments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Abonnements</h2>
          <p className="text-sm text-gray-600">Vue d'ensemble des abonnements actifs des membres</p>
        </div>

        <button
          onClick={loadPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50"
        >
          <Calendar className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Légende */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-4 text-sm text-blue-900">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Expire dans 7 jours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Actif</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Inactif / Pas d'abonnement</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Membre</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Abonnement</th>
              <th className="text-left px-4 py-3">Dernier paiement</th>
              <th className="text-left px-4 py-3">Date d'expiration</th>
              <th className="text-left px-4 py-3">Jours restants</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {memberSubscriptions.map((sub) => {
              const rowClasses = sub.isExpiringSoon
                ? 'bg-red-50 hover:bg-red-100'
                : sub.member.status === 'INACTIVE'
                  ? 'bg-gray-50 hover:bg-gray-100'
                  : 'hover:bg-gray-50';

              return (
                <tr key={sub.member.id} className={rowClasses}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {sub.isExpiringSoon && (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{sub.member.fullName}</div>
                        <div className="text-xs text-gray-500">{sub.member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sub.member.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : sub.member.status === 'INACTIVE'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sub.member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{sub.planType}</td>
                  <td className="px-4 py-3">{sub.lastPaymentDate || '-'}</td>
                  <td className="px-4 py-3">{sub.expirationDate || '-'}</td>
                  <td className="px-4 py-3">
                    {sub.daysUntilExpiry !== null ? (
                      <span
                        className={`font-medium ${
                          sub.isExpiringSoon
                            ? 'text-red-600'
                            : sub.daysUntilExpiry < 0
                              ? 'text-red-600'
                              : 'text-green-600'
                        }`}
                      >
                        {sub.daysUntilExpiry < 0 ? 'EXPIRÉ' : `${sub.daysUntilExpiry}j`}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}

            {memberSubscriptions.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Aucun membre.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && <div className="p-4 text-sm text-gray-600">Chargement...</div>}
      </div>
    </div>
  );
}
