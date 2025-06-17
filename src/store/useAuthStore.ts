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
    try {
      console.log('開始清除所有認證相關的本地儲存...');
      
      // 清除應用程式 tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // 清除 SSO tokens
      localStorage.removeItem('sso_idtoken');
      localStorage.removeItem('sso_accesstoken');
      localStorage.removeItem('sso_refreshtoken');
      
      // 清除預登入狀態
      setPreLoginType(null);
      
      console.log('所有認證相關的本地儲存已清除');
    } catch (error) {
      console.error('清除本地儲存時發生錯誤:', error);
      // 即使發生錯誤，也要嘗試清除基本的 tokens
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } catch (fallbackError) {
        console.error('基本 token 清除也失敗:', fallbackError);
      }
    }
  },
  
  login: async (username: string, password: string) => {
    try {
      // 在本地登入前，先清除任何現有的認證狀態
      const { clearAllTokens } = get();
      clearAllTokens();
      
      const response = await authAPI.login(username, password);
      const { access_token: accessToken, refresh_token: refreshToken } = response;
      
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
      const { access_token: accessToken, refresh_token: refreshToken } = response;
      
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
      const { authType } = get();
      console.log('開始登出流程，認證類型:', authType);
      
      // 1. 呼叫後端登出 API（對所有類型都適用）
      try {
        await authAPI.logout();
        console.log('後端登出 API 呼叫成功');
      } catch (backendError) {
        console.error('後端登出 API 失敗，但繼續登出流程:', backendError);
        // 不要因為後端 API 失敗就停止登出流程
      }
      
      // 2. 如果是 SSO 登入，需要額外呼叫 Keycloak 登出
      if (authType === 'sso') {
        console.log('SSO 登出 - 準備呼叫 Keycloak 登出');
        const keycloak = window.__keycloak_instance;
        
        if (keycloak && keycloak.authenticated) {
          try {
            console.log('呼叫 Keycloak 登出...');
            // 先清除本地 tokens，避免 Keycloak 登出重定向前的狀態不一致
            const { clearAllTokens } = get();
            clearAllTokens();
            set({ isAuthenticated: false, user: null, authType: null });
            
            // 呼叫 Keycloak 登出（這會重定向到登入頁）
            await keycloak.logout({
              redirectUri: window.location.origin + '/login'
            });
            
            console.log('Keycloak 登出完成');
            // 注意：這裡可能不會執行到，因為 keycloak.logout() 會重定向頁面
            return;
          } catch (keycloakError) {
            console.error('Keycloak 登出失敗:', keycloakError);
            // 即使 Keycloak 登出失敗，也要繼續本地清理
          }
        } else {
          console.log('Keycloak 實例不可用或未認證，跳過 Keycloak 登出');
        }
      }
      
      // 3. 清除所有本地狀態（對本地登入或 SSO 登出失敗的情況）
      console.log('清除所有本地認證狀態');
      const { clearAllTokens } = get();
      clearAllTokens();
      set({ isAuthenticated: false, user: null, authType: null });
      
      console.log('登出流程完成');
    } catch (error) {
      console.error('登出過程發生錯誤:', error);
      
      // 即使發生錯誤，也要確保本地狀態被清除
      try {
        const { clearAllTokens } = get();
        clearAllTokens();
        set({ isAuthenticated: false, user: null, authType: null });
        console.log('緊急清除本地狀態完成');
      } catch (cleanupError) {
        console.error('緊急清除本地狀態失敗:', cleanupError);
      }
      
      // 重新拋出錯誤，讓呼叫方知道登出過程有問題
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
          // 首先檢查 SSO token 是否需要刷新
          const keycloak = window.__keycloak_instance;
          if (keycloak) {
            try {
              const ssoRefreshed = await keycloak.updateToken(30);
              if (ssoRefreshed) {
                console.log('SSO token 在 checkAuth 中已刷新');
                // 更新 localStorage 中的 SSO tokens
                localStorage.setItem('sso_idtoken', keycloak.idToken || '');
                localStorage.setItem('sso_accesstoken', keycloak.token || '');
                localStorage.setItem('sso_refreshtoken', keycloak.refreshToken || '');
              }
            } catch (ssoError) {
              console.error('SSO token 刷新失敗:', ssoError);
              // SSO token 無法刷新，可能已經過期，清除所有 tokens
              const { clearAllTokens } = get();
              clearAllTokens();
              set({ isAuthenticated: false, user: null, authType: null });
              return false;
            }
          }

          const result = await authAPI.refresh();
          // 修正：只檢查 tokens，user 資訊可選
          if (result && result.access_token && result.refresh_token) {
            // 處理用戶資訊
            let user = result.user;
            
            // 如果 refresh API 沒有返回 user 資訊，嘗試獲取用戶資料
            if (!user) {
              try {
                console.log('Refresh API 沒有返回 user 資訊，嘗試獲取用戶資料');
                user = await authAPI.getUserProfile();
              } catch (profileError) {
                console.warn('獲取用戶資料失敗，使用預設值:', profileError);
                // 使用預設值
                user = {
                  id: '',
                  username: '',
                  name: '',
                  email: '',
                  role: 'user'
                };
              }
            }
            
            // 安全檢查使用者資訊，提供預設值
            const safeUser = user || {
              id: '',
              username: '',
              name: '',
              email: '',
              role: 'user'
            };
            
            set({ 
              isAuthenticated: true,
              user: { ...safeUser, authType: 'sso' },
              authType: 'sso'
            });
            return true;
          } else {
            // 如果應用程式 token 刷新失敗，重新獲取
            const response = await authAPI.ssoLogin();
            const { access_token: accessToken, refresh_token: refreshToken } = response;
            
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
        // 修正：只檢查 tokens，user 資訊可選
        if (result && result.access_token && result.refresh_token) {
          // 處理用戶資訊
          let user = result.user;
          
          // 如果 refresh API 沒有返回 user 資訊，嘗試獲取用戶資料
          if (!user) {
            try {
              console.log('Refresh API 沒有返回 user 資訊，嘗試獲取用戶資料');
              user = await authAPI.getUserProfile();
            } catch (profileError) {
              console.warn('獲取用戶資料失敗，使用預設值:', profileError);
              // 使用預設值
              user = {
                id: '',
                username: '',
                name: '',
                email: '',
                role: 'user'
              };
            }
          }
          
          // 安全檢查使用者資訊，提供預設值
          const safeUser = user || {
            id: '',
            username: '',
            name: '',
            email: '',
            role: 'user'
          };
          
          set({ 
            isAuthenticated: true,
            user: { ...safeUser, authType: 'local' },
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