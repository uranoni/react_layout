import { useState, useEffect, useCallback } from 'react';
import Keycloak from 'keycloak-js';
import { keycloakConfig } from '../config/keycloak.config';
import { authAPI } from '../api/api';

export const useKeycloak = () => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化 Keycloak
  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const keycloakInstance = new Keycloak(keycloakConfig);
        
        const authenticated = await keycloakInstance.init({
          onLoad: 'login-required',
          checkLoginIframe: true,
          minTimeBetweenJwksRequests: 10,
          timeSkew: 0
        });

        if (authenticated) {
          // 存儲 SSO tokens
          localStorage.setItem('sso_idtoken', keycloakInstance.idToken || '');
          localStorage.setItem('sso_accesstoken', keycloakInstance.token || '');
          localStorage.setItem('sso_refreshtoken', keycloakInstance.refreshToken || '');

          // 獲取應用程式的 token
          const response = await authAPI.getAppTokens({
            sso_url: keycloakConfig.url,
            sso_authorization: keycloakInstance.token,
            sso_access_token: keycloakInstance.token
          });

          // 存儲應用程式的 token
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        setKeycloak(keycloakInstance);
        setIsInitialized(true);
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setIsInitialized(false);
      }
    };

    initKeycloak();
  }, []);

  const login = useCallback(async () => {
    if (!keycloak) return;
    try {
      await keycloak.login();
    } catch (error) {
      console.error('SSO login failed:', error);
      throw error;
    }
  }, [keycloak]);

  const logout = useCallback(async () => {
    if (!keycloak) return;
    try {
      await keycloak.logout();
      // 清除所有 tokens
      localStorage.removeItem('sso_idtoken');
      localStorage.removeItem('sso_accesstoken');
      localStorage.removeItem('sso_refreshtoken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('SSO logout failed:', error);
      throw error;
    }
  }, [keycloak]);

  return {
    isInitialized,
    isAuthenticated: keycloak?.authenticated ?? false,
    login,
    logout
  };
}; 