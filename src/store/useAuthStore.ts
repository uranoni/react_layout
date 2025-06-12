import { create } from 'zustand';
import { authAPI } from '../api/api';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  authType: 'local' | 'sso' | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  authType: 'local' | 'sso' | null;
  login: (username: string, password: string) => Promise<void>;
  ssoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<boolean>;
}

// 檢查是否有有效的 token
const hasValidTokens = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return !!accessToken && !!refreshToken;
};

// 獲取認證類型
const getAuthType = () => {
  if (localStorage.getItem('sso_idtoken')) return 'sso';
  if (localStorage.getItem('accessToken')) return 'local';
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: hasValidTokens(),
  user: null,
  authType: getAuthType(),
  
  login: async (username: string, password: string) => {
    try {
      const { user, accessToken, refreshToken } = await authAPI.login(username, password);
      
      // 存儲 local 認證 token
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({ 
        isAuthenticated: true, 
        user: { ...user, authType: 'local' },
        authType: 'local'
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  ssoLogin: async () => {
    try {
      const { user, accessToken, refreshToken } = await authAPI.ssoLogin();
      
      // 存儲應用程式的 token
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      set({ 
        isAuthenticated: true, 
        user: { ...user, authType: 'sso' },
        authType: 'sso'
      });
    } catch (error) {
      console.error('SSO login failed:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const authType = getAuthType();
      
      if (authType === 'sso') {
        // 清除 SSO tokens
        localStorage.removeItem('sso_idtoken');
        localStorage.removeItem('sso_accesstoken');
        localStorage.removeItem('sso_refreshtoken');
      }
      
      // 清除應用程式的 tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      set({ isAuthenticated: false, user: null, authType: null });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
  
  setUser: (user: User) => {
    set({ user });
  },
  
  checkAuth: async () => {
    if (!hasValidTokens()) {
      set({ isAuthenticated: false, user: null, authType: null });
      return false;
    }
    
    try {
      const result = await authAPI.refresh();
      if (result) {
        set({ isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      set({ isAuthenticated: false, user: null, authType: null });
      return false;
    }
  }
}));

export default useAuthStore; 