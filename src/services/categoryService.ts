import { apiService } from './apiService';

export interface Category {
  id: number;
  label: string;
  ageMin?: number;
  ageMax?: number;
  sportId?: number;
  createdAt?: string;
}

export interface CreateCategoryRequest {
  label: string;
  age_min?: number;
  age_max?: number;
  sport_id?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export class CategoryService {
  async getAll(): Promise<Category[]> {
    return apiService.get<Category[]>('/categories');
  }

  async getById(id: number): Promise<Category> {
    return apiService.get<Category>(`/categories/${id}`);
  }

  async create(data: CreateCategoryRequest): Promise<Category> {
    return apiService.post<Category>('/categories', data);
  }

  async update(id: number, data: UpdateCategoryRequest): Promise<Category> {
    return apiService.put<Category>(`/categories/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/categories/${id}`);
  }
}

export const categoryService = new CategoryService();
