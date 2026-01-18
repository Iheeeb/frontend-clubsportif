import { create } from 'zustand';
import { User } from '../services';
import { authService, LoginRequest } from '../services';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(credentials);
      authService.setToken(response.token);
      set({ user: response.user, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.removeToken();
    set({ user: null, isLoading: false, error: null });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),

  initializeAuth: async () => {
    const token = authService.getToken();
    if (token && !get().user) {
      try {
        set({ isLoading: true });
        const user = await authService.getCurrentUser();
        set({ user, isLoading: false });
      } catch (error) {
        authService.removeToken();
        set({ user: null, isLoading: false });
      }
    }
  },
}));