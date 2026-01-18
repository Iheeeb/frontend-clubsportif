import { apiService } from './apiService';

export interface Session {
  id: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  idCoach?: number;
  idRoom?: number;
  idTeam?: number;
  idSport?: number;
  idCategory?: number;
}

export interface CreateSessionRequest {
  session_date: string;
  start_time: string;
  end_time: string;
  id_coach?: number;
  id_room?: number;
  id_team?: number;
  id_sport?: number;
  id_category?: number;
}

export type UpdateSessionRequest = Partial<CreateSessionRequest>;

export interface AgendaQuery {
  roomId: number;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface ConflictQuery {
  roomId: number;
  date: string;
  start_time: string;
  end_time: string;
  excludeId?: number;
}

export class SessionService {
  async getAll(): Promise<Session[]> {
    return apiService.get<Session[]>('/sessions');
  }

  async getById(id: number): Promise<Session> {
    return apiService.get<Session>(`/sessions/${id}`);
  }

  async create(data: CreateSessionRequest): Promise<Session> {
    return apiService.post<Session>('/sessions', data);
  }

  async update(id: number, data: UpdateSessionRequest): Promise<Session> {
    return apiService.put<Session>(`/sessions/${id}`, data);
  }

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/sessions/${id}`);
  }

  async getAgenda(query: AgendaQuery): Promise<Session[]> {
    const params = new URLSearchParams();
    params.set('roomId', String(query.roomId));
    if (query.date) params.set('date', query.date);
    if (query.startDate) params.set('startDate', query.startDate);
    if (query.endDate) params.set('endDate', query.endDate);
    return apiService.get<Session[]>(`/sessions/agenda?${params.toString()}`);
  }

  async checkConflicts(query: ConflictQuery): Promise<{ hasConflict: boolean; conflicts: Session[] }> {
    const params = new URLSearchParams();
    params.set('roomId', String(query.roomId));
    params.set('date', query.date);
    params.set('start_time', query.start_time);
    params.set('end_time', query.end_time);
    if (query.excludeId) params.set('excludeId', String(query.excludeId));
    return apiService.get<{ hasConflict: boolean; conflicts: Session[] }>(
      `/sessions/conflicts?${params.toString()}`
    );
  }
}

export const sessionService = new SessionService();
