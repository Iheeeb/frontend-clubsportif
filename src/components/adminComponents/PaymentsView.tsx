// PaymentsView.tsx
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Ban, RefreshCw } from 'lucide-react';
import { User, userService } from '../../services/userService';
import { Payment, paymentService } from '../../services/paymentService';

type SubscriptionPlan = { id: number; type: string; price: number; durationMonths: number };

// Plans statiques (tu peux les aligner avec ta table subscriptions plus tard)
const PLANS: SubscriptionPlan[] = [
  { id: 1, type: 'Mensuel', price: 90.99, durationMonths: 1 },
  { id: 2, type: '3 Mois', price: 240.99, durationMonths: 3 },
  { id: 3, type: '6 Mois', price: 440.99, durationMonths: 6 },
  { id: 4, type: 'Annuel', price: 790.99, durationMonths: 12 },
];

function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr);
  const dd = new Date(d.getFullYear(), d.getMonth() + months, d.getDate());
  return dd.toISOString().slice(0, 10);
}

interface PaymentsViewProps {
  membres: User[];
  selectedMember?: User | null;
  onPaymentSuccess?: (memberId: number) => void;
  onBack?: () => void;
}

export function PaymentsView({ membres, selectedMember, onPaymentSuccess, onBack }: PaymentsViewProps) {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Form
  const [memberId, setMemberId] = useState<string>(selectedMember ? String(selectedMember.id) : '');
  const [subscriptionId, setSubscriptionId] = useState<string>(String(PLANS[0]?.id ?? 1));
  const [method, setMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [amount, setAmount] = useState<string>(String(PLANS[0]?.price ?? 0));
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'paid' | 'pending' | 'canceled'>('paid');

  useEffect(() => {
    if (selectedMember?.id) setMemberId(String(selectedMember.id));
  }, [selectedMember]);

  useEffect(() => {
    const plan = PLANS.find(p => String(p.id) === subscriptionId);
    if (plan) setAmount(String(plan.price));
  }, [subscriptionId]);

  const getMemberName = (id: number) => {
    const m = membres.find(mm => mm.id === id);
    return m ? m.fullName : `#${id}`;
  };

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

  const expiringSoon = useMemo(() => {
    // basé sur derniers paiements "paid" par membre+abonnement
    const lastPaidByKey = new Map<string, Payment>();
    for (const p of payments) {
      if (p.status !== 'paid') continue;
      const key = `${p.memberId}:${p.subscriptionId}`;
      const prev = lastPaidByKey.get(key);
      if (!prev || p.paymentDate > prev.paymentDate) lastPaidByKey.set(key, p);
    }

    const now = new Date();
    const soon: Array<{ payment: Payment; endDate: string; plan: SubscriptionPlan | undefined }> = [];
    for (const payment of lastPaidByKey.values()) {
      const plan = PLANS.find(pl => pl.id === payment.subscriptionId);
      if (!plan) continue;
      const endDate = addMonths(payment.paymentDate, plan.durationMonths);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        soon.push({ payment, endDate, plan });
      }
    }
    soon.sort((a, b) => a.endDate.localeCompare(b.endDate));
    return soon;
  }, [payments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mid = parseInt(memberId, 10);
    const sid = parseInt(subscriptionId, 10);
    const amt = Number(amount);

    if (!mid || Number.isNaN(mid)) return alert('Choisis un membre');
    if (!sid || Number.isNaN(sid)) return alert('Choisis un abonnement');
    if (!amt || Number.isNaN(amt) || amt <= 0) return alert('Montant invalide');
    if (!paymentDate) return alert('Date invalide');

    try {
      const payload = {
        id_member: mid,
        id_subscription: sid,
        amount: amt,
        payment_date: paymentDate,
        method,
        status,
      };
      
      console.log('DEBUG - Sending payment payload:', payload);

      const created = await paymentService.create(payload);

      // Si le paiement est "paid", mettre à jour le statut du membre à ACTIVE
      if (created.status === 'paid') {
        try {
          await userService.updateStatus(mid, { status: 'ACTIVE' });
          console.log('DEBUG - Membre statut mis à jour à ACTIVE');
        } catch (err) {
          console.error('Erreur lors de la mise à jour du statut:', err);
        }
        onPaymentSuccess?.(mid);
      }

      // refresh liste
      const list = await paymentService.getAll();
      setPayments(list);

      alert('Paiement enregistré');
    } catch (err: any) {
      console.error('ERROR:', err);
      console.error('Error response:', err.response?.data);
      alert("Erreur lors de l'enregistrement du paiement: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async (p: Payment) => {
    if (!confirm('Annuler ce paiement ?')) return;
    try {
      await paymentService.cancel(p.id);
      const list = await paymentService.getAll();
      setPayments(list);
      alert('Paiement annulé');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'annulation");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Encaissement</h2>
          <p className="text-sm text-gray-600">Pas de paiement en ligne.</p>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          )}

          <button
            onClick={loadPayments}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-3">Nouveau paiement</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membre</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Choisir...</option>
              {membres.map(m => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Abonnement</label>
            <select
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              {PLANS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.type} - {p.price.toFixed(2)} DT / {p.durationMonths} mois
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Méthode</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="card">Carte</option>
              <option value="transfer">Virement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (DT)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="paid">paid</option>
              <option value="pending">pending</option>
              <option value="canceled">canceled</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Expiring soon */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-3">Abonnements qui expirent bientôt (7j)</h3>
        {expiringSoon.length === 0 ? (
          <div className="text-sm text-gray-600">Aucun abonnement n’expire bientôt.</div>
        ) : (
          <ul className="text-sm text-gray-800 list-disc pl-5">
            {expiringSoon.map(({ payment, endDate, plan }) => (
              <li key={`${payment.memberId}-${payment.subscriptionId}`}>
                {getMemberName(payment.memberId)} — {plan?.type} — fin estimée: {endDate}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Membre</th>
              <th className="text-left px-4 py-3">Abonnement</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Fin estimée</th>
              <th className="text-left px-4 py-3">Montant</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {payments.map((p) => {
              const plan = PLANS.find(pl => pl.id === p.subscriptionId);
              const endDate = plan ? addMonths(p.paymentDate, plan.durationMonths) : '—';

              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{getMemberName(p.memberId)}</td>
                  <td className="px-4 py-3">{plan ? plan.type : `#${p.subscriptionId}`}</td>
                  <td className="px-4 py-3">{p.paymentDate}</td>
                  <td className="px-4 py-3">{endDate}</td>
                  <td className="px-4 py-3">{p.amount.toFixed(2)} DT</td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleCancel(p)}
                      disabled={p.status === 'canceled'}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50"
                      title="Annuler"
                    >
                      <Ban className="w-4 h-4" />
                      Annuler
                    </button>
                  </td>
                </tr>
              );
            })}

            {payments.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Aucun paiement.
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
