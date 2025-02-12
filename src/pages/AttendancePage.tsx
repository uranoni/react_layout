import styles from './AttendancePage.module.css';
import Table from '../components/Table';
import { useState } from 'react';

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const columns = [
    { title: '員工編號', key: 'id' },
    { title: '姓名', key: 'name' },
    { title: '部門', key: 'department' },
    { title: '上班時間', key: 'checkIn' },
    { title: '下班時間', key: 'checkOut' },
    { title: '狀態', key: 'status' }
  ];

  const data = [
    {
      id: '001',
      name: '張三',
      department: '研發部',
      checkIn: '09:00',
      checkOut: '18:00',
      status: '正常'
    },
    {
      id: '002',
      name: '李四',
      department: '行政部',
      checkIn: '09:15',
      checkOut: '18:00',
      status: '遲到'
    },
    {
      id: '002',
      name: '李四',
      department: '行政部',
      checkIn: '09:15',
      checkOut: '18:00',
      status: '遲到'
    },    {
      id: '002',
      name: '李四',
      department: '行政部',
      checkIn: '09:15',
      checkOut: '18:00',
      status: '遲到'
    },    {
      id: '002',
      name: '李四',
      department: '行政部',
      checkIn: '09:15',
      checkOut: '18:00',
      status: '遲到'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>出勤管理</h1>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'daily' ? styles.active : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <i className="fas fa-calendar-day"></i>
            每日出勤
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'summary' ? styles.active : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <i className="fas fa-table"></i>
            出勤總表
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'schedule' ? styles.active : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <i className="fas fa-calendar-alt"></i>
            排班管理
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'daily' && (
          <div className={styles.tableWrapper}>
            <Table columns={columns} data={data} />
          </div>
        )}
        {activeTab === 'summary' && (
          <div>出勤總表內容</div>
        )}
        {activeTab === 'schedule' && (
          <div>排班管理內容</div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage; 