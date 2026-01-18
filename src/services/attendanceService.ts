import { apiService } from './apiService';

export interface Attendance {
  id: number;
  idMember: number;
  idSession: number;
  status: 'present' | 'absent' | 'late';
}

export interface CreateAttendanceRequest {
  id_member: number;
  id_session: number;
  status: 'present' | 'absent' | 'late';
}

export type UpdateAttendanceRequest = Partial<CreateAttendanceRequest>;

export interface BulkAttendanceRequest {
  id_session: number;
  items: Array<{ id_member: number; status: 'present' | 'absent' | 'late' }>;
}

export class AttendanceService {
  async getAll(): Promise<Attendance[]> {
    return apiService.get<Attendance[]>('/attendance');
  }

  async getById(id: number): Promise<Attendance> {
    return apiService.get<Attendance>(`/attendance/${id}`);
  }

  async create(data: CreateAttendanceRequest): Promise<Attendance> {
    return apiService.post<Attendance>('/attendance', data);
  }

  async update(id: number, data: UpdateAttendanceRequest): Promise<Attendance> {
    return apiService.put<Attendance>(`/attendance/${id}`, data);
  }

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/attendance/${id}`);
  }

  async getBySession(sessionId: number): Promise<Attendance[]> {
    return apiService.get<Attendance[]>(`/attendance/by-session/${sessionId}`);
  }

  async bulkUpsert(data: BulkAttendanceRequest): Promise<Attendance[]> {
    return apiService.post<Attendance[]>('/attendance/bulk', data);
  }
}

export const attendanceService = new AttendanceService();
