import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  notification: NotificationState;
  showNotification: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
  closeNotification: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  themeMode: 'light',
  toggleTheme: () => set((state) => ({ 
    themeMode: state.themeMode === 'dark' ? 'light' : 'dark' 
  })),

  notification: {
    open: false,
    message: '',
    severity: 'success',
  },

  showNotification: (message, severity = 'success') => set({
    notification: {
      open: true,
      message,
      severity,
    }
  }),

  closeNotification: () => set((state) => ({
    notification: {
      ...state.notification,
      open: false,
    }
  })),
}));
