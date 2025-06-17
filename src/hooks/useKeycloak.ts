import { useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';
import { keycloakConfig } from '../config/keycloak.config';

const keycloak = new Keycloak(keycloakConfig);

export const useKeycloak = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        console.log('開始初始化 Keycloak...');
        
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          redirectUri: window.location.origin + '/callback-sso'
        });

        console.log('Keycloak 初始化完成，認證狀態:', authenticated);
        
        // 將 Keycloak 實例暴露到 window 物件上，供 API 使用
        window.__keycloak_instance = keycloak;
        
        setIsAuthenticated(authenticated);
        setIsInitialized(true);

        // 如果已經認證，設置 token 自動刷新
        if (authenticated) {
          setupTokenRefresh();
        }
      } catch (error) {
        console.error('Keycloak 初始化失敗:', error);
        setIsInitialized(true);
        setIsAuthenticated(false);
      }
    };

    initKeycloak();
  }, []);

  // 設置 token 自動刷新機制
  const setupTokenRefresh = () => {
    // 每 30 秒檢查一次 token 是否需要刷新（在過期前 70 秒刷新）
    const refreshInterval = setInterval(async () => {
      try {
        const refreshed = await keycloak.updateToken(70);
        if (refreshed) {
          console.log('SSO token 已自動刷新');
          // 更新 localStorage 中的 SSO tokens
          localStorage.setItem('sso_idtoken', keycloak.idToken || '');
          localStorage.setItem('sso_accesstoken', keycloak.token || '');
          localStorage.setItem('sso_refreshtoken', keycloak.refreshToken || '');
        }
      } catch (error) {
        console.error('SSO token 刷新失敗:', error);
        // 如果 refresh token 也過期了，清除 SSO tokens 並重定向到登入頁
        clearSSOTokens();
        setIsAuthenticated(false);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }, 30000); // 每 30 秒檢查一次

    // 返回清理函數
    return () => clearInterval(refreshInterval);
  };

  // 手動刷新 SSO token
  const refreshSSOToken = async () => {
    try {
      const refreshed = await keycloak.updateToken(0); // 強制刷新
      if (refreshed) {
        console.log('SSO token 手動刷新成功');
        // 更新 localStorage 中的 SSO tokens
        localStorage.setItem('sso_idtoken', keycloak.idToken || '');
        localStorage.setItem('sso_accesstoken', keycloak.token || '');
        localStorage.setItem('sso_refreshtoken', keycloak.refreshToken || '');
        return true;
      }
      return false;
    } catch (error) {
      console.error('手動刷新 SSO token 失敗:', error);
      return false;
    }
  };

  // 檢查 SSO token 是否有效
  const isTokenValid = () => {
    return keycloak.authenticated && !keycloak.isTokenExpired();
  };

  // 清除 SSO tokens
  const clearSSOTokens = () => {
    localStorage.removeItem('sso_idtoken');
    localStorage.removeItem('sso_accesstoken');
    localStorage.removeItem('sso_refreshtoken');
  };

  const login = async () => {
    try {
      await keycloak.login();
    } catch (error) {
      console.error('Keycloak 登入失敗:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('useKeycloak: 開始 Keycloak 登出流程...');
      
      // 檢查 Keycloak 是否已認證
      if (!keycloak.authenticated) {
        console.log('useKeycloak: Keycloak 未認證，跳過登出');
        return;
      }
      
      // 只清除 SSO 相關的 tokens，應用程式 tokens 由 useAuthStore 處理
      clearSSOTokens();
      
      // 呼叫 Keycloak 登出，這會清除伺服器端的 session 並重定向
      await keycloak.logout({
        redirectUri: window.location.origin + '/login'
      });
      
      console.log('useKeycloak: Keycloak 登出完成');
    } catch (error) {
      console.error('useKeycloak: Keycloak 登出失敗:', error);
      // 即使 Keycloak 登出失敗，也要清除本地 SSO tokens
      clearSSOTokens();
      throw error;
    }
  };

  return {
    isInitialized,
    isAuthenticated,
    login,
    logout,
    keycloak,
    refreshSSOToken,
    isTokenValid,
    clearSSOTokens
  };
};

export default useKeycloak; 