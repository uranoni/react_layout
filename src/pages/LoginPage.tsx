import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [useraccount, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 獲取重定向的來源路徑
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(useraccount, password);
      if (success) {
        // 登入成功後導向原來的頁面或首頁
        navigate(from, { replace: true });
      } else {
        setError('登入失敗，請檢查您的帳號和密碼');
      }
    } catch (err) {
      setError('登入時發生錯誤，請稍後再試');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>登入系統</h1>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.formGroup}>
          <label>用戶名</label>
          <input
            type="text"
            value={useraccount}
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
          {isLoading ? '登入中...' : '登入'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage; 