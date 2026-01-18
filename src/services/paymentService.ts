// paymentService.ts
import { apiService } from './apiService';

export interface Payment {
  id: number;
  memberId: number;
  subscriptionId: number;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  method: 'cash' | 'card' | 'transfer';
  status: 'paid' | 'pending' | 'canceled';
}

export interface CreatePaymentRequest {
  id_member: number;
  id_subscription: number;
  amount: number;
  payment_date?: string; // YYYY-MM-DD
  method: 'cash' | 'card' | 'transfer';
  status?: 'paid' | 'pending' | 'canceled';
}

export type UpdatePaymentRequest = Partial<CreatePaymentRequest>;

const adaptPaymentFromApi = (p: any): Payment => {
  return {
    id: p.id ?? p.id_payment ?? p.idPayment,
    memberId: p.memberId ?? p.idMember ?? p.id_member,
    subscriptionId: p.subscriptionId ?? p.idSubscription ?? p.id_subscription,
    amount: typeof p.amount === 'string' ? Number(p.amount) : p.amount,
    paymentDate: p.paymentDate ?? p.payment_date ?? p.paymentDate,
    method: p.method,
    status: p.status ?? 'paid',
  };
};

export class PaymentService {
  async getAll(): Promise<Payment[]> {
    const data = await apiService.get<any[]>('/payments');
    return (data || []).map(adaptPaymentFromApi);
  }

  async getById(id: number): Promise<Payment> {
    const data = await apiService.get<any>(`/payments/${id}`);
    return adaptPaymentFromApi(data);
  }

  async create(data: CreatePaymentRequest): Promise<Payment> {
    const created = await apiService.post<any>('/payments', data);
    return adaptPaymentFromApi(created);
  }

  async update(id: number, data: UpdatePaymentRequest): Promise<Payment> {
    const updated = await apiService.put<any>(`/payments/${id}`, data);
    return adaptPaymentFromApi(updated);
  }

  async delete(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/payments/${id}`);
  }

  async getByMember(memberId: number): Promise<Payment[]> {
    const data = await apiService.get<any[]>(`/payments/member/${memberId}`);
    return (data || []).map(adaptPaymentFromApi);
  }

  async getExpiring(days = 7): Promise<any[]> {
    return apiService.get(`/payments/expiring?days=${days}`);
  }

  async cancel(paymentId: number): Promise<any> {
    return apiService.patch(`/payments/${paymentId}/cancel`);
  }
}

export const paymentService = new PaymentService();
