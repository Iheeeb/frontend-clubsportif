import { apiService } from './apiService';

export interface Competition {
  id: number;
  name: string;
  competitionDate: string;
  location?: string;
}

export interface CreateCompetitionRequest {
  name: string;
  competition_date: string;
  location?: string;
}

export interface UpdateCompetitionRequest extends Partial<CreateCompetitionRequest> {}

export class CompetitionService {
  async getAll(): Promise<Competition[]> {
    return apiService.get<Competition[]>('/competitions');
  }

  async getById(id: number): Promise<Competition> {
    return apiService.get<Competition>(`/competitions/${id}`);
  }

  async create(data: CreateCompetitionRequest): Promise<Competition> {
    return apiService.post<Competition>('/competitions', data);
  }

  async update(id: number, data: UpdateCompetitionRequest): Promise<Competition> {
    return apiService.put<Competition>(`/competitions/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/competitions/${id}`);
  }
}

export const competitionService = new CompetitionService();