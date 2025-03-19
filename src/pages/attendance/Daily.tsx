import { useState } from 'react';
import styles from './Daily.module.css';
import Table from '../../components/Table';

const Daily = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const columns = [
    { title: '員工編號', key: 'id' },
    { title: '姓名', key: 'name' },
    { title: '部門', key: 'department' },
    { title: '上班時間', key: 'checkIn' },
    { title: '下班時間', key: 'checkOut' },
    { title: '狀態', key: 'status' },
    { title: '操作', key: 'actions' }
  ];

  const data = [
    {
      id: '001',
      name: '張三',
      department: '研發部',
      checkIn: '09:00',
      checkOut: '18:00',
      status: '正常',
      actions: '編輯'
    },
    {
      id: '002',
      name: '李四',
      department: '行政部',
      checkIn: '09:15',
      checkOut: '18:00',
      status: '遲到',
      actions: '編輯'
    }
  ];

  return (
    <div className={styles.container}>
      {/* 頂部操作區 */}
      <div className={styles.actionBar}>
        <div className={styles.leftActions}>
          <div className={styles.dateFilter}>
            <label>選擇日期：</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="搜尋員工..."
              className={styles.searchInput}
            />
          </div>
        </div>
        <div className={styles.rightActions}>
          <button className={styles.actionButton}>
            <i className="fas fa-file-export"></i>
            匯出報表
          </button>
          <button className={styles.actionButton}>
            <i className="fas fa-clock"></i>
            一鍵打卡
          </button>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>應到人數</span>
          <span className={styles.statValue}>50</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>實到人數</span>
          <span className={styles.statValue}>48</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>請假人數</span>
          <span className={styles.statValue}>2</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>遲到人數</span>
          <span className={styles.statValue}>1</span>
        </div>
      </div>

      {/* 表格區域 */}
      <div className={styles.tableWrapper}>
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Daily;
