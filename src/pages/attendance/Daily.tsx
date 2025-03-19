import { useState, useEffect } from 'react';
import styles from './Daily.module.css';
import Table from '../../components/Table';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useLeaveStore } from '../../store/leaveStore';

const Daily = () => {
  const { attendanceRecords, engineers, fetchAttendanceData, batchCheckIn } = useAttendanceStore();
  const { leaveRecords } = useLeaveStore();
  
  // 使用當地時區格式化日期
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEids, setSelectedEids] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEids([]);
    } else {
      // 只選擇非請假的員工
      const availableEids = filteredData
        .filter(record => record.status !== 'Leave')
        .map(record => record.eid);
      setSelectedEids(availableEids);
    }
    setSelectAll(!selectAll);
  };

  const handleSelect = (eid: string, status: string) => {
    // 如果是請假狀態，不允許選擇
    if (status === 'Leave') return;
    
    if (selectedEids.includes(eid)) {
      setSelectedEids(selectedEids.filter(id => id !== eid));
    } else {
      setSelectedEids([...selectedEids, eid]);
    }
  };

  const handleBatchCheckIn = () => {
    if (selectedEids.length > 0) {
      batchCheckIn(selectedEids);
      setSelectedEids([]);
      setSelectAll(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedEids([]);
    setSelectAll(false);
  };

  // 獲取代理人名稱
  const getProxyName = (proxyAccount: string | null) => {
    if (!proxyAccount) return '';
    const proxy = engineers.find(eng => eng.account === proxyAccount);
    return proxy ? proxy.name : '';
  };

  // 處理資料以顯示部門
  const tableData = attendanceRecords.map(record => {
    const engineer = engineers.find(eng => eng.account === record.account);
    return {
      ...record,
      department: engineer?.department || ''
    };
  });

  // 篩選資料
  const filteredData = tableData.filter(record => {
    // 如果沒有搜尋關鍵字，返回所有資料
    if (!searchKeyword) return true;
    
    // 搜尋工號、帳號或姓名
    const keyword = searchKeyword.toLowerCase();
    return (
      record.eid.toLowerCase().includes(keyword) ||
      record.account.toLowerCase().includes(keyword) ||
      record.name.toLowerCase().includes(keyword)
    );
  });

  const columns = [
    { 
      title: '選取', 
      key: 'select',
      render: (record: any) => (
        <input 
          type="checkbox" 
          checked={selectedEids.includes(record.eid)}
          onChange={() => handleSelect(record.eid, record.status)}
          disabled={record.status === 'Leave'}
        />
      )
    },
    { title: '員工編號', key: 'eid' },
    { title: '帳號', key: 'account' },
    { title: '姓名', key: 'name' },
    { title: '部門', key: 'department' },
    { 
      title: '狀態', 
      key: 'status',
      render: (record: any) => {
        let statusText = '';
        let statusClass = '';
        
        switch(record.status) {
          case 'Checked-in':
            statusText = '已簽到';
            statusClass = styles.checkedIn;
            break;
          case 'Pending':
            statusText = '尚未簽到';
            statusClass = styles.pending;
            break;
          case 'Leave':
            statusText = '請假';
            statusClass = styles.leave;
            break;
        }
        
        return <span className={`${styles.status} ${statusClass}`}>{statusText}</span>;
      }
    },
    { title: '簽到時間', key: 'time' },
    { 
      title: '代理人', 
      key: 'proxy',
      render: (record: any) => record.proxy ? getProxyName(record.proxy) : '-'
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
              onChange={handleDateChange}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="搜尋員工..."
              className={styles.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.rightActions}>
          <button 
            className={styles.actionButton}
            onClick={handleSelectAll}
          >
            {selectAll ? '取消全選' : '全選'}
          </button>
          <button 
            className={styles.actionButton}
            onClick={handleBatchCheckIn}
            disabled={selectedEids.length === 0}
          >
            一鍵打卡
          </button>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>總人數</span>
          <span className={styles.statValue}>{filteredData.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>已簽到</span>
          <span className={styles.statValue}>
            {filteredData.filter(r => r.status === 'Checked-in').length}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>未簽到</span>
          <span className={styles.statValue}>
            {filteredData.filter(r => r.status === 'Pending').length}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>請假</span>
          <span className={styles.statValue}>
            {filteredData.filter(r => r.status === 'Leave').length}
          </span>
        </div>
      </div>

      {/* 表格區域 */}
      <div className={styles.tableWrapper}>
        <Table 
          columns={columns} 
          data={filteredData} 
        />
      </div>
    </div>
  );
};

export default Daily;
