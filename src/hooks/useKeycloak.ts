import { useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';
import { keycloakConfig } from '../config/keycloak.config';
import { authAPI } from '../api/api';

const keycloak = new Keycloak(keycloakConfig);

export const useKeycloak = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          redirectUri: window.location.origin + '/callback-sso'
        });

        if (authenticated) {
          // 儲存 SSO tokens
          localStorage.setItem('sso_idtoken', keycloak.idToken || '');
          localStorage.setItem('sso_accesstoken', keycloak.token || '');
          localStorage.setItem('sso_refreshtoken', keycloak.refreshToken || '');

          // 設置預登入狀態為 SSO
          localStorage.setItem('preLoginType', 'sso');

          // 獲取應用程式 tokens
          const response = await authAPI.ssoLogin();
          const { accessToken, refreshToken } = response;
          
          // 如果有使用者資訊則儲存
          if (response.user) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
          }
        }

        setIsAuthenticated(authenticated);
        setIsInitialized(true);
      } catch (error) {
        console.error('Keycloak 初始化失敗:', error);
        setIsInitialized(true);
      }
    };

    initKeycloak();
  }, []);

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
      await keycloak.logout();
      // 清除所有 tokens 和預登入狀態
      localStorage.removeItem('sso_idtoken');
      localStorage.removeItem('sso_accesstoken');
      localStorage.removeItem('sso_refreshtoken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('preLoginType');
    } catch (error) {
      console.error('Keycloak 登出失敗:', error);
      throw error;
    }
  };

  return {
    isInitialized,
    isAuthenticated,
    login,
    logout,
    keycloak
  };
};

export default useKeycloak; 