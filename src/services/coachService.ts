import { apiService } from './apiService';
import { User, CreateUserRequest, UpdateUserRequest } from './userService';

export interface Coach extends User {
  speciality?: string;
  experience_years?: number;
  diploma?: string;
}

export interface CreateCoachRequest extends CreateUserRequest {
  speciality?: string;
  experience_years?: number;
  diploma?: string;
}

export interface UpdateCoachRequest extends UpdateUserRequest {}

export class CoachService {
  async getAll(): Promise<Coach[]> {
    const users = await apiService.get<User[]>('/users');
    return users.filter(user => user.role === 'COACH') as Coach[];
  }

  async getById(id: number): Promise<Coach> {
    return apiService.get<Coach>(`/users/${id}`);
  }

  async create(data: CreateCoachRequest): Promise<Coach> {
    const coachData = { ...data, role: 'COACH' as const };
    return apiService.post<Coach>('/users', coachData);
  }

  async update(id: number, data: UpdateCoachRequest): Promise<Coach> {
    return apiService.put<Coach>(`/users/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/users/${id}`);
  }
}

export const coachService = new CoachService();