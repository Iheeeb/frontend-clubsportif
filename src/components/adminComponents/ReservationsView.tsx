import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { FieldReservation } from '../../services/fieldReservationService';

interface ReservationsViewProps {
  reservations: FieldReservation[];
  loading: boolean;
  onUpdateStatus: (id: number, status: 'acceptee' | 'refusee') => Promise<void>;
}

export function ReservationsView({ reservations, loading, onUpdateStatus }: ReservationsViewProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'demandee':
        return 'En attente';
      case 'acceptee':
        return 'Acceptée';
      case 'refusee':
        return 'Refusée';
      case 'reservee':
        return 'Réservée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acceptee':
      case 'reservee':
        return 'bg-green-100 text-green-800';
      case 'refusee':
        return 'bg-red-100 text-red-800';
      case 'demandee':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Gestion des réservations de terrain</h2>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">Aucune réservation pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map(reservation => (
            <div key={reservation.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {reservation.fullName}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p>{reservation.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                      <p>{reservation.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p>{formatDate(reservation.reservationDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Horaire</p>
                      <p>{reservation.startTime} - {reservation.endTime}</p>
                    </div>
                  </div>
                  {reservation.message && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-1">Message</p>
                      <p className="text-sm text-gray-700 italic">{reservation.message}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-center whitespace-nowrap ${getStatusColor(reservation.status)}`}>
                    {getStatusLabel(reservation.status)}
                  </span>
                  {reservation.status === 'demandee' && (
                    <div className="flex gap-2">
                      <button
                        title="Accepter la réservation"
                        onClick={() => onUpdateStatus(reservation.id, 'acceptee')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        title="Refuser la réservation"
                        onClick={() => onUpdateStatus(reservation.id, 'refusee')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}