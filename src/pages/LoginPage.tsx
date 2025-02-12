import { useState } from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../store/useAuthStore';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>登入系統</h1>
        <div className={styles.formGroup}>
          <label>用戶名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">登入</button>
      </form>
    </div>
  );
};

export default LoginPage; 