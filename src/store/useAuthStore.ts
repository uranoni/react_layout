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
  clearAllTokens: () => void;
}

// 預登入狀態鍵值
const PRE_LOGIN_TYPE_KEY = 'preLoginType';

// 設置預登入類型
const setPreLoginType = (type: 'local' | 'sso' | null) => {
  if (type) {
    localStorage.setItem(PRE_LOGIN_TYPE_KEY, type);
  } else {
    localStorage.removeItem(PRE_LOGIN_TYPE_KEY);
  }
};

// 獲取預登入類型
const getPreLoginType = (): 'local' | 'sso' | null => {
  const type = localStorage.getItem(PRE_LOGIN_TYPE_KEY);
  return type as 'local' | 'sso' | null;
};

// 檢查是否有有效的 token
const hasValidTokens = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  return !!accessToken && !!refreshToken;
};

// 從 localStorage 获取 token
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

// 设置 token 到 localStorage
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// 清除 token
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// 改進的認證類型判斷
const getAuthType = (): 'local' | 'sso' | null => {
  // 1. 優先使用預登入狀態標記
  const preLoginType = getPreLoginType();
  if (preLoginType) {
    // 驗證對應的 tokens 是否存在
    if (preLoginType === 'sso') {
      const ssoIdToken = localStorage.getItem('sso_idtoken');
      const ssoAccessToken = localStorage.getItem('sso_accesstoken');
      const accessToken = localStorage.getItem('access_token');
      if (ssoIdToken && ssoAccessToken && accessToken) {
        return 'sso';
      }
    } else if (preLoginType === 'local') {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const ssoIdToken = localStorage.getItem('sso_idtoken');
      if (accessToken && refreshToken && !ssoIdToken) {
        return 'local';
      }
    }
  }
  
  // 2. 如果預登入狀態無效，清除標記並回退到原邏輯
  setPreLoginType(null);
  
  // 3. 回退到基於 tokens 的判斷（但較不可靠）
  if (localStorage.getItem('sso_idtoken') && localStorage.getItem('sso_accesstoken')) {
    return 'sso';
  }
  if (localStorage.getItem('access_token') && localStorage.getItem('refresh_token')) {
    return 'local';
  }
  
  return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: hasValidTokens(),
  user: null,
  authType: getAuthType(),
  
  // 清除所有 tokens 的輔助函數
  clearAllTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('sso_idtoken');
    localStorage.removeItem('sso_accesstoken');
    localStorage.removeItem('sso_refreshtoken');
    setPreLoginType(null); // 清除預登入狀態
  },
  
  login: async (username: string, password: string) => {
    try {
      // 在本地登入前，先清除任何現有的認證狀態
      const { clearAllTokens } = get();
      clearAllTokens();
      
      const response = await authAPI.login(username, password);
      const { accessToken, refreshToken } = response;
      
      // 安全檢查使用者資訊，提供預設值
      const user = response.user || {
        id: '',
        username: username || '',
        name: '',
        email: '',
        role: 'user'
      };
      
      // 儲存本地認證 token（不儲存 SSO tokens）
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      setPreLoginType('local'); // 設置預登入狀態為本地登入
      
      set({ 
        isAuthenticated: true, 
        user: { ...user, authType: 'local' },
        authType: 'local'
      });
    } catch (error) {
      console.error('本地登入失敗:', error);
      throw error;
    }
  },
  
  ssoLogin: async () => {
    try {
      // 在 SSO 登入前，先清除任何現有的本地認證狀態（但保留 SSO tokens）
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      const response = await authAPI.ssoLogin();
      const { accessToken, refreshToken } = response;
      
      // 安全檢查使用者資訊，提供預設值
      const user = response.user || {
        id: '',
        username: '',
        name: '',
        email: '',
        role: 'user'
      };
      
      // 儲存應用程式的 token（SSO tokens 已經在 CallbackSSO 或 useKeycloak 中儲存）
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      setPreLoginType('sso'); // 設置預登入狀態為 SSO 登入
      
      set({ 
        isAuthenticated: true, 
        user: { ...user, authType: 'sso' },
        authType: 'sso'
      });
    } catch (error) {
      console.error('SSO 登入失敗:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // 呼叫後端登出 API
      await authAPI.logout();
      
      // 清除所有 tokens 和預登入狀態
      const { clearAllTokens } = get();
      clearAllTokens();
      
      set({ isAuthenticated: false, user: null, authType: null });
    } catch (error) {
      console.error('登出失敗:', error);
      // 即使登出失敗，也要清除本地 tokens
      const { clearAllTokens } = get();
      clearAllTokens();
      set({ isAuthenticated: false, user: null, authType: null });
      throw error;
    }
  },
  
  setUser: (user: User) => {
    set({ user });
  },
  
  checkAuth: async () => {
    const authType = getAuthType();
    
    if (!hasValidTokens()) {
      // 清除所有狀態包括預登入狀態
      const { clearAllTokens } = get();
      clearAllTokens();
      set({ isAuthenticated: false, user: null, authType: null });
      return false;
    }
    
    try {
      if (authType === 'sso') {
        // SSO 認證：檢查 SSO tokens 是否存在且有效
        const ssoIdToken = localStorage.getItem('sso_idtoken');
        const ssoAccessToken = localStorage.getItem('sso_accesstoken');
        const ssoRefreshToken = localStorage.getItem('sso_refreshtoken');
        
        if (!ssoIdToken || !ssoAccessToken || !ssoRefreshToken) {
          // 如果 SSO tokens 不完整，清除所有 tokens
          const { clearAllTokens } = get();
          clearAllTokens();
          set({ isAuthenticated: false, user: null, authType: null });
          return false;
        }
        
        // 嘗試刷新應用程式 token
        try {
          const result = await authAPI.refresh();
          if (result && result.user) {
            // 安全檢查使用者資訊
            const user = result.user || {
              id: '',
              username: '',
              name: '',
              email: '',
              role: 'user'
            };
            
            set({ 
              isAuthenticated: true,
              user: { ...user, authType: 'sso' },
              authType: 'sso'
            });
            return true;
          } else {
            // 如果應用程式 token 刷新失敗，重新獲取
            const response = await authAPI.ssoLogin();
            const { accessToken, refreshToken } = response;
            
            // 安全檢查使用者資訊
            const user = response.user || {
              id: '',
              username: '',
              name: '',
              email: '',
              role: 'user'
            };
            
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            
            set({ 
              isAuthenticated: true,
              user: { ...user, authType: 'sso' },
              authType: 'sso'
            });
            return true;
          }
        } catch (error) {
          console.error('SSO 應用程式 token 刷新失敗:', error);
          throw error;
        }
      } else if (authType === 'local') {
        // 本地認證：使用應用程式的 refresh token
        const result = await authAPI.refresh();
        if (result && result.user) {
          // 安全檢查使用者資訊
          const user = result.user || {
            id: '',
            username: '',
            name: '',
            email: '',
            role: 'user'
          };
          
          set({ 
            isAuthenticated: true,
            user: { ...user, authType: 'local' },
            authType: 'local'
          });
          return true;
        }
        return false;
      } else {
        // 無法確定認證類型，清除所有 tokens
        const { clearAllTokens } = get();
        clearAllTokens();
        set({ isAuthenticated: false, user: null, authType: null });
        return false;
      }
    } catch (error) {
      console.error('認證檢查失敗:', error);
      // 清除所有 tokens 並重設狀態
      const { clearAllTokens } = get();
      clearAllTokens();
      set({ isAuthenticated: false, user: null, authType: null });
      return false;
    }
  }
}));

export default useAuthStore; 