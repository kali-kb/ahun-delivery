import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  
  setAuthenticated: (value: boolean) => {
    console.log('Auth state updated:', value);
    set({ isAuthenticated: value });
  },
  
  checkAuth: async () => {
    try {
      const { authClient } = await import('../lib/authClient');
      const session = await authClient.getSession();
      const hasSession = !!session.data?.user;
      set({ isAuthenticated: hasSession });
      return hasSession;
    } catch (error) {
      console.error('Auth check error:', error);
      set({ isAuthenticated: false });
      return false;
    }
  },
}));
