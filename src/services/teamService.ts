// teamService.ts
import { apiService } from './apiService';

export interface Team {
  id: number;
  name: string;
  sportId?: number;
  categoryId?: number;
  coachId?: number;
  ageCategory?: string; // optionnel legacy
}

export interface CreateTeamRequest {
  name: string;
  id_sport?: number;
  id_category?: number;
  id_coach?: number;
  age_category?: string; // optionnel legacy
}

export type UpdateTeamRequest = Partial<CreateTeamRequest>;

export interface TeamsByCategoryQuery {
  sportId: number;
  categoryId: number;
}

export interface NextTeamNumberQuery {
  sportId: number;
  categoryId: number;
  suffix?: string;
}

function adaptTeamFromApi(t: any): Team {
  return {
    id: t.id ?? t.id_team,
    name: t.name,
    ageCategory: t.ageCategory ?? t.age_category,

    // backend peut renvoyer soit idSport/idCategory/idCoach, soit sportId/categoryId/coachId
    sportId: t.sportId ?? t.idSport ?? t.id_sport,
    categoryId: t.categoryId ?? t.idCategory ?? t.id_category,
    coachId: t.coachId ?? t.idCoach ?? t.id_coach,
  };
}

export class TeamService {
  async getAll(): Promise<Team[]> {
    const data = await apiService.get<any[]>('/teams');
    return (data || []).map(adaptTeamFromApi);
  }

  async getById(id: number): Promise<Team> {
    const data = await apiService.get<any>(`/teams/${id}`);
    return adaptTeamFromApi(data);
  }

  async create(data: CreateTeamRequest): Promise<Team> {
    const created = await apiService.post<any>('/teams', data);
    return adaptTeamFromApi(created);
  }

  async update(id: number, data: UpdateTeamRequest): Promise<Team> {
    const updated = await apiService.put<any>(`/teams/${id}`, data);
    return adaptTeamFromApi(updated);
  }

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/teams/${id}`);
  }

  async getByCategory(query: TeamsByCategoryQuery): Promise<Team[]> {
    const params = new URLSearchParams();
    params.set('sportId', String(query.sportId));
    params.set('categoryId', String(query.categoryId));
    const data = await apiService.get<any[]>(`/teams/by-category?${params.toString()}`);
    return (data || []).map(adaptTeamFromApi);
  }

  async getNextNumber(
    query: NextTeamNumberQuery
  ): Promise<{ nextNumber: number; suffix: string | null }> {
    const params = new URLSearchParams();
    params.set('sportId', String(query.sportId));
    params.set('categoryId', String(query.categoryId));
    if (query.suffix) params.set('suffix', query.suffix);
    return apiService.get<{ nextNumber: number; suffix: string | null }>(
      `/teams/next-number?${params.toString()}`
    );
  }

  async addMember(teamId: number, id_member: number): Promise<any> {
    return apiService.post(`/teams/${teamId}/members`, { id_member });
  }

  async removeMember(teamId: number, memberId: number): Promise<any> {
    return apiService.delete(`/teams/${teamId}/members/${memberId}`);
  }
}

export const teamService = new TeamService();
