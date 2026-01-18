import { apiService } from './apiService';

export interface Subscription {
  id: number;
  type: string;
  price: number;
  duration: number;
  description?: string;
}

export interface CreateSubscriptionRequest {
  type: string;
  price: number;
  duration: number;
  description?: string;
}

export interface UpdateSubscriptionRequest extends Partial<CreateSubscriptionRequest> {}

export class SubscriptionService {
  async getAll(): Promise<Subscription[]> {
    return apiService.get<Subscription[]>('/subscriptions');
  }

  async getById(id: number): Promise<Subscription> {
    return apiService.get<Subscription>(`/subscriptions/${id}`);
  }

  async create(data: CreateSubscriptionRequest): Promise<Subscription> {
    return apiService.post<Subscription>('/subscriptions', data);
  }

  async update(id: number, data: UpdateSubscriptionRequest): Promise<Subscription> {
    return apiService.put<Subscription>(`/subscriptions/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/subscriptions/${id}`);
  }
}

export const subscriptionService = new SubscriptionService();