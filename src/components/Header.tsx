import styles from './Header.module.css';
import useThemeStore from '../store/useThemeStore';

const Header = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className={styles.header}>
      {/* 左側 Logo 和搜尋 */}
      <div className={styles.leftSection}>
        <div className={styles.logo}>
          {/* 使用文字替代圖片 logo */}
          <span className={styles.logoText}>LOGO</span>
        </div>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input type="text" placeholder="搜尋..." />
        </div>
      </div>

      {/* 右側功能區 */}
      <div className={styles.rightSection}>
        {/* 主題切換 */}
        <button onClick={toggleTheme} className={styles.iconButton}>
          <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
        </button>

        {/* 語言切換 */}
        <div className={styles.language}>
          <i className="fas fa-globe"></i>
          <span>中文</span>
        </div>

        {/* 通知 */}
        <button className={styles.iconButton}>
          <i className="fas fa-bell"></i>
        </button>

        {/* 用戶資訊 */}
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <img src="https://via.placeholder.com/36" alt="User Avatar" />
          </div>
          <div className={styles.userName}>
            <span>管理員</span>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 