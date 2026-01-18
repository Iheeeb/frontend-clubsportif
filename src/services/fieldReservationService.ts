import { apiService } from './apiService';

export interface FieldReservation {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  message?: string;
  idRoom: number;
  status: 'demandee' | 'acceptee' | 'reservee' | 'refusee';
  createdAt: string;
}

export interface CreateFieldReservationRequest {
  full_name: string;
  phone: string;
  email?: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  message?: string;
  id_room: number;
}

export interface UpdateFieldReservationRequest extends Partial<CreateFieldReservationRequest> {
  status?: 'demandee' | 'acceptee' | 'reservee' | 'refusee';
}

export class FieldReservationService {
  async getAll(): Promise<FieldReservation[]> {
    return apiService.get<FieldReservation[]>('/field-reservations');
  }

  async getById(id: number): Promise<FieldReservation> {
    return apiService.get<FieldReservation>(`/field-reservations/${id}`);
  }

  async create(data: CreateFieldReservationRequest): Promise<FieldReservation> {
    return apiService.post<FieldReservation>('/field-reservations', data);
  }

  async update(id: number, data: UpdateFieldReservationRequest): Promise<FieldReservation> {
    return apiService.put<FieldReservation>(`/field-reservations/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/field-reservations/${id}`);
  }
}

export const fieldReservationService = new FieldReservationService();