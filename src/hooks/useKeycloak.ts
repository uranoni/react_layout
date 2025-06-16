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
        
        setIsAuthenticated(authenticated);
        setIsInitialized(true);
      } catch (error) {
        console.error('Keycloak 初始化失敗:', error);
        setIsInitialized(true);
        setIsAuthenticated(false);
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
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