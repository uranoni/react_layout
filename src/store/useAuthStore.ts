import { create } from 'zustand';
import { authAPI } from '../api/api';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<boolean>;
}

// 檢查是否有 token 來判斷是否已登入
const hasTokens = () => {
  return !!localStorage.getItem('accessToken') && !!localStorage.getItem('refreshToken');
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: hasTokens(),
  user: null,
  
  login: async (username: string, password: string) => {
    try {
      const { user } = await authAPI.login(username, password);
      set({ isAuthenticated: true, user });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      set({ isAuthenticated: false, user: null });
    }
  },
  
  setUser: (user: User) => {
    set({ user });
  },
  
  checkAuth: async () => {
    if (!hasTokens()) {
      set({ isAuthenticated: false, user: null });
      return false;
    }
    
    try {
      const result = await authAPI.refresh();
      // 只檢查是否成功刷新 token，不檢查 user 資訊
      if (result) {
        set({ isAuthenticated: true });
        return true;
      } else {
        set({ isAuthenticated: false, user: null });
        return false;
      }
    } catch (error) {
      set({ isAuthenticated: false, user: null });
      return false;
    }
  }
}));

export default useAuthStore; 