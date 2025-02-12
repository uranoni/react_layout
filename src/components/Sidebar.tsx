import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          <div className={styles.navTitle}>主要功能</div>
          <div className={styles.navItem}>
            <i className="fas fa-home"></i>
            <span>首頁</span>
          </div>
          <div className={styles.navItem}>
            <i className="fas fa-clock"></i>
            <span>出勤系統</span>
          </div>
          <div className={styles.navGroup}>
            <div className={styles.navTitle}>系統管理</div>
            <div className={styles.navItem}>
              <i className="fas fa-chart-bar"></i>
              <span>統計報表</span>
            </div>
            <div className={styles.navItem}>
              <i className="fas fa-cog"></i>
              <span>系統設定</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 