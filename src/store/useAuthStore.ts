import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  login: (username: string, password: string) => {
    // 這裡應該實作實際的登入邏輯
    set({ isAuthenticated: true });
  },
  logout: () => set({ isAuthenticated: false }),
}));

export default useAuthStore; 