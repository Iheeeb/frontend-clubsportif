import { Calendar, UserCheck, MessageSquare } from 'lucide-react';
import { CoachView } from './CoachTypes';

interface CoachSidebarProps {
  currentView: CoachView;
  onViewChange: (view: CoachView) => void;
}

export function CoachSidebar({ currentView, onViewChange }: CoachSidebarProps) {
  return (
    <nav className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
        <button
          onClick={() => onViewChange('seances')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === 'seances'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-5 h-5" />
          Mes séances
        </button>
        <button
          onClick={() => onViewChange('absences')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === 'absences'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          Absences
        </button>
        <button
          onClick={() => onViewChange('messages')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === 'messages'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          Messages
        </button>
      </div>
    </nav>
  );
}