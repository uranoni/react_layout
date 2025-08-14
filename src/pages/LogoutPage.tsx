import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import styles from './LogoutPage.module.css';

const LogoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { reason, message } = location.state || {};

  useEffect(() => {
    // 自動跳轉到登入頁面
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 5000); // 5秒後自動跳轉

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleManualRedirect = () => {
    navigate('/login', { replace: true });
  };

  const getReasonText = () => {
    switch (reason) {
      case 'SSO_LOGIN_FAILED':
        return 'SSO 登入失敗';
      case 'FORCE_LOGOUT_FAILED':
        return '強制登出失敗';
      default:
        return '登出完成';
    }
  };

  const getMessageText = () => {
    if (message) return message;
    
    switch (reason) {
      case 'SSO_LOGIN_FAILED':
        return 'SSO 登入失敗，系統已自動清除所有認證狀態並強制登出。';
      case 'FORCE_LOGOUT_FAILED':
        return '強制登出過程發生問題，建議手動清除瀏覽器資料。';
      default:
        return '您已成功登出系統。';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoutCard}>
        <div className={styles.icon}>
          {reason === 'SSO_LOGIN_FAILED' || reason === 'FORCE_LOGOUT_FAILED' ? '⚠️' : '✅'}
        </div>
        
        <h1 className={styles.title}>{getReasonText()}</h1>
        
        <p className={styles.message}>{getMessageText()}</p>
        
        {reason === 'SSO_LOGIN_FAILED' && (
          <div className={styles.warning}>
            <h3>已執行的操作：</h3>
            <ul>
              <li>清除所有本地認證 tokens</li>
              <li>清除 localStorage 狀態</li>
              <li>呼叫後端分散式 session 清除 API</li>
              <li>重置應用程式認證狀態</li>
            </ul>
          </div>
        )}
        
        {reason === 'FORCE_LOGOUT_FAILED' && (
          <div className={styles.error}>
            <h3>建議操作：</h3>
            <ul>
              <li>清除瀏覽器 cookies 和 localStorage</li>
              <li>重新啟動瀏覽器</li>
              <li>聯繫系統管理員</li>
            </ul>
          </div>
        )}
        
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={handleManualRedirect}
          >
            立即前往登入頁面
          </button>
          
          <p className={styles.autoRedirect}>
            5 秒後將自動跳轉到登入頁面...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
