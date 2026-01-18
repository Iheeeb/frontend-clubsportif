import { apiService } from './apiService';

export interface Sport {
  id: number;
  name: string;
  createdAt?: string;
}

export interface CreateSportRequest {
  name: string;
}

export interface UpdateSportRequest extends Partial<CreateSportRequest> {}

export class SportService {
  async getAll(): Promise<Sport[]> {
    return apiService.get<Sport[]>('/sports');
  }

  async getById(id: number): Promise<Sport> {
    return apiService.get<Sport>(`/sports/${id}`);
  }

  async create(data: CreateSportRequest): Promise<Sport> {
    return apiService.post<Sport>('/sports', data);
  }

  async update(id: number, data: UpdateSportRequest): Promise<Sport> {
    return apiService.put<Sport>(`/sports/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/sports/${id}`);
  }
}

export const sportService = new SportService();
