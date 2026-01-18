import { apiService } from './apiService';

export interface Room {
  id: number;
  name: string;
  type: 'SALLE' | 'TERRAIN';
  capacity?: number;
  idSport: number;
}

export interface CreateRoomRequest {
  name: string;
  type: 'SALLE' | 'TERRAIN';
  capacity?: number;
  id_sport: number;
}

export type UpdateRoomRequest = Partial<CreateRoomRequest>;

export class RoomService {
  async getAll(): Promise<Room[]> {
    return apiService.get<Room[]>('/rooms');
  }

  async getById(id: number): Promise<Room> {
    return apiService.get<Room>(`/rooms/${id}`);
  }

  async create(data: CreateRoomRequest): Promise<Room> {
    return apiService.post<Room>('/rooms', data);
  }

  async update(id: number, data: UpdateRoomRequest): Promise<Room> {
    return apiService.put<Room>(`/rooms/${id}`, data);
  }

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/rooms/${id}`);
  }

  async getBySport(sportId: number): Promise<Room[]> {
    return apiService.get<Room[]>(`/rooms/by-sport/${sportId}`);
  }
}

export const roomService = new RoomService();
