import styles from './Header.module.css';
import useThemeStore from '../store/useThemeStore';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className={styles.header}>
      {/* 左側搜尋和折疊按鈕 */}
      <div className={styles.leftSection}>
        <button className={styles.collapseBtn} onClick={onToggleSidebar}>
          折疊選單
        </button>
        <div className={styles.searchBar}>
          <span>搜尋</span>
          <input type="text" placeholder="搜尋..." />
        </div>
      </div>

      {/* 右側功能區 */}
      <div className={styles.rightSection}>
        {/* 主題切換 */}
        <button onClick={toggleTheme} className={styles.iconButton}>
          {theme === 'light' ? '深色模式' : '淺色模式'}
        </button>

        {/* 語言切換 */}
        <div className={styles.language}>
          <span>語言</span>
          <span>中文</span>
        </div>

        {/* 通知 */}
        <button className={styles.iconButton}>
          通知
        </button>

        {/* 用戶資訊 */}
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            頭像
          </div>
          <div className={styles.userName}>
            <span>管理員</span>
            <span>▼</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 