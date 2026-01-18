import { Absence } from './CoachTypes';

interface AbsencesViewProps {
  absences: Absence[];
}

export function AbsencesView({ absences }: AbsencesViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-gray-900">Historique des absences</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Membre</th>
              <th className="px-6 py-3 text-left text-gray-700">Sport</th>
              <th className="px-6 py-3 text-left text-gray-700">Date</th>
              <th className="px-6 py-3 text-left text-gray-700">Enregistré par</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {absences.map(absence => (
              <tr key={absence.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{absence.membreNom}</td>
                <td className="px-6 py-4 text-gray-600">{absence.sport}</td>
                <td className="px-6 py-4 text-gray-600">{absence.date}</td>
                <td className="px-6 py-4 text-gray-600">{absence.enregistrePar}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {absences.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucune absence enregistrée</p>
        )}
      </div>
    </div>
  );
}