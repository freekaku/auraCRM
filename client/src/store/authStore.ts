import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    localStorage.setItem('aura_crm_token', token);
    localStorage.setItem('aura_crm_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('aura_crm_token');
    localStorage.removeItem('aura_crm_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    const token = localStorage.getItem('aura_crm_token');
    const userJson = localStorage.getItem('aura_crm_user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        set({ token, user, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('aura_crm_token');
        localStorage.removeItem('aura_crm_user');
      }
    }
  },
}));
