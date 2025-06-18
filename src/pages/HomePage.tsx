import styles from './HomePage.module.css';
import useAuth from '../hooks/useAuth';

const HomePage = () => {
  const { user } = useAuth();

  // 根據時間顯示不同的問候語
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
  };

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1>
          {getGreeting()}，{user?.name || user?.username || '用戶'}！
          <span className={styles.welcomeSubtitle}>歡迎使用管理系統</span>
        </h1>
        {user && (
          <div className={styles.userWelcome}>
            <p>
              您好，{user.name || user.username}
              {user.role && user.role !== 'user' && ` (${user.role})`}
              ，今天是 {new Date().toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
            <small className={styles.loginType}>
              登入方式：{user.authType === 'sso' ? 'SSO 單一登入' : '本地帳號登入'}
            </small>
          </div>
        )}
      </div>
      
      <div className={styles.dashboard}>
        <div className={styles.card}>
          <h3>今日出勤</h3>
          <p>85%</p>
        </div>
        <div className={styles.card}>
          <h3>請假人數</h3>
          <p>3 人</p>
        </div>
        <div className={styles.card}>
          <h3>遲到人數</h3>
          <p>1 人</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 