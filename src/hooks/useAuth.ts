import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../store/useAuthStore';

export const useAuth = () => {
  const { 
    isAuthenticated, 
    user, 
    login, 
    logout, 
    forceLogout,
    checkAuth 
  } = useAuthStore();
  
  const navigate = useNavigate();

  // 自動 Token 刷新
  useEffect(() => {
    if (!isAuthenticated) return;
    
    checkAuth();
    const intervalId = setInterval(() => {
      checkAuth();
    }, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, checkAuth]);

  // UI 友好的登入函數
  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      console.error('登入失敗:', error);
      throw error;
    }
  };

  // UI 友好的 SSO 登入函數
  const handleSSOLogin = async () => {
    try {
      const { ssoLogin } = useAuthStore.getState();
      await ssoLogin();
      navigate('/');
    } catch (error) {
      console.error('SSO 登入失敗:', error);
      
      // 檢查是否是 SSO 登入失敗的特殊錯誤
      if (error instanceof Error && error.name === 'SSO_LOGIN_FAILED') {
        console.warn('SSO 登入失敗，執行強制登出流程');
        
        try {
          // 執行強制登出
          await forceLogout();
          
          // 強制跳轉到登出頁面
          navigate('/logout', { 
            replace: true,
            state: { 
              reason: 'SSO_LOGIN_FAILED',
              message: 'SSO 登入失敗，已強制登出'
            }
          });
        } catch (forceLogoutError) {
          console.error('強制登出失敗:', forceLogoutError);
          
          // 即使強制登出失敗，也要跳轉到登出頁面
          navigate('/logout', { 
            replace: true,
            state: { 
              reason: 'FORCE_LOGOUT_FAILED',
              message: 'SSO 登入失敗且強制登出失敗，請手動清除瀏覽器資料'
            }
          });
        }
      } else {
        // 其他類型的錯誤，正常處理
        throw error;
      }
    }
  };

  // UI 友好的登出函數
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失敗:', error);
      // 即使登出失敗，也要重定向到登入頁
      navigate('/login');
    }
  };

  return {
    isAuthenticated,
    user,
    login: handleLogin,
    ssoLogin: handleSSOLogin, // 添加 SSO 登入函數
    logout: handleLogout,
    forceLogout, // 導出強制登出函數
    checkAuth
  };
};

export default useAuth; 