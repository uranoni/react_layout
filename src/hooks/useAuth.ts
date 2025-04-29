import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useSWR from 'swr';
import useAuthStore from '../store/useAuthStore';
import { authAPI } from '../api/api';

// 用於 SWR 的 fetcher 函數
const profileFetcher = async () => {
  try {
    return await authAPI.getUserProfile();
  } catch (error) {
    throw error;
  }
};

export const useAuth = () => {
  const { 
    isAuthenticated, 
    user, 
    login, 
    logout, 
    setUser,
    checkAuth 
  } = useAuthStore();
  const navigate = useNavigate();

  // 使用 SWR 獲取用戶資料
  const { data: userData, error, mutate } = useSWR(
    isAuthenticated ? '/user/profile' : null,
    profileFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1分鐘內不重複請求
      onSuccess: (data) => {
        setUser(data);
      },
      onError: (err) => {
        console.error('Failed to fetch user profile:', err);
        // 如果獲取用戶資料失敗，嘗試刷新 token
        checkAuth();
      }
    }
  );

  // 自動刷新 token
  useEffect(() => {
    if (!isAuthenticated) return;

    // 初始檢查
    checkAuth();

    // 設置定時刷新 (每小時)
    const intervalId = setInterval(() => {
      checkAuth();
    }, 60 * 60 * 1000); // 1小時

    return () => clearInterval(intervalId);
  }, [isAuthenticated, checkAuth]);

  // 登入函數
  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      await login(username, password);
      // 登入成功後重新獲取用戶資料
      mutate();
      navigate('/');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, [login, navigate, mutate]);

  // 登出函數
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  return {
    isAuthenticated,
    user: user || userData,
    isLoading: !error && !userData && isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    refreshUser: mutate
  };
};

export default useAuth; 