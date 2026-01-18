import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InactiveAccountPageProps {
  email: string;
  onReset: () => void;
}

export function InactiveAccountPage({ email, onReset }: InactiveAccountPageProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    onReset();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <h2 className="text-gray-900 text-center text-xl font-bold mb-2">
            Compte Inactif
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Votre compte n'est pas actuellement actif
          </p>

          {/* Info Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6">
            <h3 className="text-amber-900 font-semibold mb-3">Raisons possibles :</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Problème avec votre compte</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Paiement d'adhésion non complété</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Vérification en attente par un administrateur</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-blue-900 font-semibold mb-1">Contactez l'administration</h4>
                <p className="text-sm text-blue-800">
                  Veuillez prendre contact avec un administrateur pour activer votre compte ou résoudre les problèmes de paiement.
                </p>
              </div>
            </div>
          </div>

          {/* Email Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-xs text-gray-600 mb-1">Email utilisé</p>
            <p className="text-sm font-mono text-gray-900 break-all">{email}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBack}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </button>
            <button
              onClick={onReset}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Réessayer avec un autre compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
