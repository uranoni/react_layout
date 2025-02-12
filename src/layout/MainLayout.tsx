import { Outlet } from 'react-router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <div className={styles.layout}>
      {/* 頂部 Header */}
      <div className={styles.headerContainer}>
        <Header />
      </div>

      {/* 中間部分 */}
      <div className={styles.container}>
        {/* 左側邊欄 */}
        <div className={styles.sidebar}>
          <Sidebar />
        </div>

        {/* 主要內容區 */}
        <div className={styles.content}>
          <div className={styles.pageWrapper}>
            <Outlet />
          </div>
        </div>
      </div>

      {/* 底部 Footer */}
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout; 