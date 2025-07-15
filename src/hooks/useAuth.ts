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

  // 当后端 /user/profile API 修复后，取消注释以下代码即可恢复原功能：

/*
// 恢复时取消注释这部分
const { data: userData, error, mutate } = useSWR(
  isAuthenticated ? '/user/profile' : null,
  profileFetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    onSuccess: (data) => {
      setUser(data);
    },
    onError: (err) => {
      console.error('Failed to fetch user profile:', err);
      checkAuth();
    }
  }
);

// 并删除临时的空对象
// const userData = null;
// const error = null;
// const mutate = async () => {};

// 在handleLogin中恢复mutate()调用
// mutate();

// 恢复原来的isLoading逻辑
// isLoading: !error && !userData && isAuthenticated,
*/

  // 临时的空对象，避免SWR相关错误
  const userData = null;
  const error = null;
  const mutate = async () => {};

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
      // 登入成功後重新獲取用戶資料（暂时注释掉）
      // mutate();
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
    isLoading: false, // 暂时设为false，避免无限loading
    login: handleLogin,
    logout: handleLogout,
    refreshUser: mutate
  };
};

export default useAuth; 