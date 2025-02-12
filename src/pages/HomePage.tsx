import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.container}>
      <h1>歡迎使用管理系統</h1>
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