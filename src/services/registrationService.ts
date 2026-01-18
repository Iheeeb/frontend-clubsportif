import { apiService } from './apiService';

export interface Registration {
  id: number;
  idMember: number;
  idCompetition: number;
  registrationDate: string;
}

export interface CreateRegistrationRequest {
  id_member: number;
  id_competition: number;
  registration_date?: string;
}

export interface UpdateRegistrationRequest extends Partial<CreateRegistrationRequest> {}

export class RegistrationService {
  async getAll(): Promise<Registration[]> {
    return apiService.get<Registration[]>('/registrations');
  }

  async getById(id: number): Promise<Registration> {
    return apiService.get<Registration>(`/registrations/${id}`);
  }

  async create(data: CreateRegistrationRequest): Promise<Registration> {
    return apiService.post<Registration>('/registrations', data);
  }

  async update(id: number, data: UpdateRegistrationRequest): Promise<Registration> {
    return apiService.put<Registration>(`/registrations/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/registrations/${id}`);
  }
}

export const registrationService = new RegistrationService();