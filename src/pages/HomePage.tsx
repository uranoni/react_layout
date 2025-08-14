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
          {getGreeting()}，{user?.username || '用戶'}！
          <span className={styles.welcomeSubtitle}>歡迎使用管理系統</span>
        </h1>
        {user && (
          <div className={styles.userWelcome}>
            <p>
              您好，{user.username}
              ，今天是 {new Date().toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
            <div className={styles.userInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>帳號：</span>
                <span className={styles.infoValue}>{user.useraccount}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>電話：</span>
                <span className={styles.infoValue}>{user.tel || '未設定'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>地點：</span>
                <span className={styles.infoValue}>{user.location || '未設定'}</span>
              </div>
            </div>
            <small className={styles.loginType}>
              登入方式：{user.authType === 'sso' ? 'SSO 單一登入' : '本地帳號登入'}
            </small>
          </div>
        )}
      </div>
      
      {/* 系統權限卡片 */}
      {user && user.systems && user.systems.length > 0 && (
        <div className={styles.systemsSection}>
          <h2 className={styles.sectionTitle}>系統權限</h2>
          <div className={styles.systemsGrid}>
            {user.systems.map((system) => (
              <div key={system.systemName} className={styles.systemCard}>
                <div className={styles.systemHeader}>
                  <h3 className={styles.systemName}>{system.systemName}</h3>
                  <span className={styles.roleCount}>{system.roles.length} 個權限</span>
                </div>
                <div className={styles.rolesContainer}>
                  {system.roles.map((role, roleIndex) => (
                    <span key={roleIndex} className={styles.roleTag}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 如果沒有系統權限，顯示提示 */}
      {user && (!user.systems || user.systems.length === 0) && (
        <div className={styles.noSystems}>
          <p>暫無系統權限資訊</p>
        </div>
      )}
    </div>
  );
};

export default HomePage; 