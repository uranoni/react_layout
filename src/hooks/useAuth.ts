import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../store/useAuthStore';
import { authAPI } from '../api/api';

export const useAuth = () => {
  const { 
    isAuthenticated, 
    accessToken, 
    refreshToken, 
    user, 
    login, 
    logout, 
    refreshAuth 
  } = useAuthStore();
  const navigate = useNavigate();

  // 自動刷新 token
  useEffect(() => {
    if (!refreshToken) return;

    // 初始刷新
    refreshAuth();

    // 設置定時刷新 (每小時)
    const intervalId = setInterval(() => {
      refreshAuth();
    }, 60 * 60 * 1000); // 1小時

    return () => clearInterval(intervalId);
  }, [refreshToken, refreshAuth]);

  // 獲取用戶資料
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && accessToken && !user) {
        try {
          const userData = await authAPI.getUserProfile();
          useAuthStore.getState().setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, accessToken, user]);

  // 登入函數
  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      await login(username, password);
      navigate('/');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, [login, navigate]);

  // 登出函數
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  return {
    isAuthenticated,
    user,
    login: handleLogin,
    logout: handleLogout,
    refreshAuth
  };
};

export default useAuth; 