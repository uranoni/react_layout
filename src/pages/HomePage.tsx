import styles from './HomePage.module.css';
import useAuth from '../hooks/useAuth';
import Card from '../components/Card';
import { useNavigate } from 'react-router';

interface SystemRole {
  systemName: string;
  roles: string[];
}

interface UserProfile {
  useraccount: string;
  username: string;
  tel: string;
  location: string;
  systems: SystemRole[];
}

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 固定的用戶資料
  const userProfile: UserProfile = {
    useraccount: "user001",
    username: "張三",
    tel: "0912345001",
    location: "台北",
    systems: [
      {
        systemName: "attendance",
        roles: ["admin", "boss"]
      },
      {
        systemName: "ioc",
        roles: ["site_leader"]
      }
    ]
  };

  // 根據時間顯示不同的問候語
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
  };

  // 系統圖標映射
  const getSystemIcon = (systemName: string) => {
    const iconMap: Record<string, string> = {
      'attendance': '📊',
      'ioc': '🏭',
      'hr': '👥',
      'finance': '💰',
      'inventory': '📦',
      'reports': '📈'
    };
    return iconMap[systemName.toLowerCase()] || '🔧';
  };

  // 系統中文名稱映射
  const getSystemDisplayName = (systemName: string) => {
    const nameMap: Record<string, string> = {
      'attendance': '考勤管理',
      'ioc': 'IOC 系統',
      'hr': '人力資源',
      'finance': '財務管理',
      'inventory': '庫存管理',
      'reports': '報表系統'
    };
    return nameMap[systemName.toLowerCase()] || systemName;
  };

  // 處理系統點擊導向
  const handleSystemClick = (systemName: string) => {
    const routeMap: Record<string, string> = {
      'attendance': '/attendance',
      'ioc': '/ioc',
      'hr': '/hr',
      'finance': '/finance',
      'inventory': '/inventory',
      'reports': '/reports'
    };

    const route = routeMap[systemName.toLowerCase()];
    if (route) {
      navigate(route);
    } else {
      navigate(`/system/${systemName.toLowerCase()}`);
    }
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
      
      {/* 員工權限及路口 */}
      {userProfile && userProfile.systems && userProfile.systems.length > 0 && (
        <div className={styles.systemsSection}>
          <h2 className={styles.sectionTitle}>員工權限及路口</h2>
          <div className={styles.systemsGrid}>
            {userProfile.systems.map((system: SystemRole) => (
              <Card
                key={system.systemName}
                className={styles.systemCard}
                onClick={() => handleSystemClick(system.systemName)}
                isClickable={true}
                variant="elevated"
              >
                <div className={styles.cardHeader}>
                  <div className={styles.systemIcon}>
                    {getSystemIcon(system.systemName)}
                  </div>
                  <div className={styles.systemInfo}>
                    <h3 className={styles.systemName}>
                      {getSystemDisplayName(system.systemName)}
                    </h3>
                    <span className={styles.systemCode}>{system.systemName}</span>
                  </div>
                  <div className={styles.roleCount}>
                    {system.roles.length} 個權限
                  </div>
                </div>
                
                <div className={styles.rolesContainer}>
                  {system.roles.map((role: string, roleIndex: number) => (
                    <span key={roleIndex} className={styles.roleTag}>
                      {role}
                    </span>
                  ))}
                </div>
                
                <div className={styles.cardFooter}>
                  <span className={styles.clickHint}>點擊進入系統</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 如果沒有系統權限，顯示提示 */}
      {userProfile && (!userProfile.systems || userProfile.systems.length === 0) && (
        <div className={styles.noSystems}>
          <p>暫無系統權限資訊</p>
        </div>
      )}
    </div>
  );
};

export default HomePage; 