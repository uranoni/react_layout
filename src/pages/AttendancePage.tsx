import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router';
import styles from './AttendancePage.module.css';

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch(tab) {
      case 'daily':
        navigate('/attendance/daily');
        break;
      case 'leave':
        navigate('/attendance/leave');
        break;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>出勤管理</h1>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'daily' ? styles.active : ''}`}
            onClick={() => handleTabChange('daily')}
          >
            <i className="fas fa-calendar-day"></i>
            每日出勤
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'leave' ? styles.active : ''}`}
            onClick={() => handleTabChange('leave')}
          >
            <i className="fas fa-calendar-times"></i>
            請假系統
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default AttendancePage; 