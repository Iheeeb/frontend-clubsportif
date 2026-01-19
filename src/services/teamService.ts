// teamService.ts
import { apiService } from './apiService';

export interface Team {
  id: number;
  name: string;
  sport: string;
  categorie: string;
  coachId?: number | null;
}

export interface CreateTeamRequest {
  name: string;
  sport: string;
  categorie: string;
  id_coach?: number | null;
}

export type UpdateTeamRequest = Partial<{
  name: string;
  sport: string;
  categorie: string;
  id_coach: number | null;
}>;

export interface TeamsByCategoryQuery {
  sport: string;
  categorie: string;
}

export interface NextTeamNumberQuery {
  sport: string;
  categorie: string;
}

function adaptTeamFromApi(t: any): Team {
  return {
    id: t.id ?? t.id_team,
    name: t.name,
    sport: t.sport,
    categorie: t.categorie,
    coachId: t.coachId ?? t.idCoach ?? t.id_coach ?? null,
  };
}

export class TeamService {
  async getAll(): Promise<Team[]> {
    const data = await apiService.get('/teams');
    return (data || []).map(adaptTeamFromApi);
  }

  async getById(id: number): Promise<Team> {
    const data = await apiService.get(`/teams/${id}`);
    return adaptTeamFromApi(data);
  }

  async create(data: CreateTeamRequest): Promise<Team> {
    const created = await apiService.post('/teams', data);
    return adaptTeamFromApi(created);
  }

  async update(id: number, data: UpdateTeamRequest): Promise<Team> {
    const updated = await apiService.put(`/teams/${id}`, data);
    return adaptTeamFromApi(updated);
  }

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/teams/${id}`);
  }

  async getByCategory(query: TeamsByCategoryQuery): Promise<Team[]> {
    const params = new URLSearchParams();
    params.set('sport', query.sport);
    params.set('categorie', query.categorie);

    const url = `/teams/by-category?${params.toString()}`;
    const data = await apiService.get(url);

    return (data || []).map(adaptTeamFromApi);
  }

  async getNextNumber(
    query: NextTeamNumberQuery
  ): Promise<{ nextNumber: number; suffix: string | null }> {
    const params = new URLSearchParams();
    params.set('sport', query.sport);
    params.set('categorie', query.categorie);

    const url = `/teams/next-number?${params.toString()}`;
    return apiService.get<{ nextNumber: number; suffix: string | null }>(url);
  }

  async addMember(teamId: number, id_member: number): Promise<any> {
    return apiService.post(`/teams/${teamId}/members`, { id_member });
  }

  async removeMember(teamId: number, memberId: number): Promise<any> {
    return apiService.delete(`/teams/${teamId}/members/${memberId}`);
  }
}

export const teamService = new TeamService();
