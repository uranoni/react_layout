import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  refreshAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      
      login: async (username: string, password: string) => {
        try {
          const { accessToken, refreshToken, user } = await authAPI.login(username, password);
          set({ 
            isAuthenticated: true, 
            accessToken, 
            refreshToken, 
            user 
          });
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
          set({ 
            isAuthenticated: false, 
            accessToken: null, 
            refreshToken: null, 
            user: null 
          });
        }
      },
      
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },
      
      setUser: (user: User) => {
        set({ user });
      },
      
      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        
        try {
          const { accessToken, refreshToken: newRefreshToken, user } = await authAPI.refresh(refreshToken);
          set({ 
            isAuthenticated: true, 
            accessToken, 
            refreshToken: newRefreshToken, 
            user 
          });
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          set({ 
            isAuthenticated: false, 
            accessToken: null, 
            refreshToken: null, 
            user: null 
          });
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken,
        user: state.user
      }),
    }
  )
);

export default useAuthStore; 