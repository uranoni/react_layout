import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import useAuthStore from '../store/useAuthStore';
import { useKeycloak } from '../hooks/useKeycloak';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { login: ssoLogin, ssoEnabled } = useKeycloak();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 獲取重定向的來源路徑
  const from = location.state?.from?.pathname || '/';

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('登入失敗，請檢查您的帳號和密碼');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    if (!ssoEnabled) {
      setError('SSO 功能目前未啟用');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await ssoLogin();
      navigate(from, { replace: true });
    } catch (err) {
      setError('SSO 登入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginOptions}>
        <form className={styles.form} onSubmit={handleLocalLogin}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.formGroup}>
            <label>用戶名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={isLoading ? styles.buttonLoading : ''}
          >
            {isLoading ? '登入中...' : '本地登入'}
          </button>
        </form>

        {/* 只有在 SSO 啟用時才顯示 SSO 登入選項 */}
        {ssoEnabled && (
          <>
            <div className={styles.divider}>
              <span className={styles.dividerLine}></span>
              <span className={styles.dividerText}>或</span>
              <span className={styles.dividerLine}></span>
            </div>

            <button 
              className={styles.ssoButton}
              onClick={handleSSOLogin}
              disabled={isLoading}
            >
              {isLoading ? '登入中...' : '使用 SSO 登入'}
            </button>
          </>
        )}

        {/* 顯示 SSO 狀態提示 */}
        {!ssoEnabled && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px', 
            fontSize: '0.9rem', 
            color: '#666' 
          }}>
            💡 提示：SSO 功能目前未配置，僅可使用本地登入
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 