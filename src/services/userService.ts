import { apiService } from './apiService';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'COACH' | 'MEMBER';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
  updatedAt: string;

  date_of_birth?: string;
  gender?: string;
  join_date?: string;
  medical_note?: string;
  address?: string;

  speciality?: string;
  experience_years?: number;
  diploma?: string;
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  adress?: string;
  role: 'ADMIN' | 'COACH' | 'MEMBER';

  date_of_birth?: string;
  gender?: string;
  join_date?: string;
  medical_note?: string;

  speciality?: string;
  experience_years?: number;
  diploma?: string;
}

export type CreateMemberRequest = Omit<CreateUserRequest, 'role'>;
export type CreateCoachRequest = Omit<CreateUserRequest, 'role'>;

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  adress?: string;
  role?: 'ADMIN' | 'COACH' | 'MEMBER';
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';

  date_of_birth?: string;
  gender?: string;
  join_date?: string;
  medical_note?: string;

  speciality?: string;
  experience_years?: number;
  diploma?: string;
}

export interface UpdateStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
}

export interface SubscriptionStatus {
  userId: number;
  isActive?: boolean;
  reason?: string;
  lastPaymentId?: number;
  subscriptionId?: number;
  duration?: number | null;
  paymentDate?: string;
}

export class UserService {
  async getAll(): Promise<User[]> {
    return apiService.get<User[]>('/users');
  }

  async getById(id: number): Promise<User> {
    return apiService.get<User>(`/users/${id}`);
  }

  async create(data: CreateUserRequest): Promise<User> {
    return apiService.post<User>('/users', data);
  }

  async update(id: number, data: UpdateUserRequest): Promise<User> {
    return apiService.put<User>(`/users/${id}`, data);
  }

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/users/${id}`);
  }

  // Endpoints métier
  async getMembers(): Promise<User[]> {
    return apiService.get<User[]>('/users/members');
  }

  async getCoaches(): Promise<User[]> {
    return apiService.get<User[]>('/users/coaches');
  }

  async createMember(data: CreateMemberRequest): Promise<User> {
    return apiService.post<User>('/users/members', data);
  }

  async createCoach(data: CreateCoachRequest): Promise<User> {
    return apiService.post<User>('/users/coaches', data);
  }

  async updateStatus(id: number, data: UpdateStatusRequest): Promise<User> {
    return apiService.patch<User>(`/users/${id}/status`, data);
  }

  async getSubscriptionStatus(id: number): Promise<SubscriptionStatus> {
    return apiService.get<SubscriptionStatus>(`/users/${id}/subscription-status`);
  }
}

export const userService = new UserService();
