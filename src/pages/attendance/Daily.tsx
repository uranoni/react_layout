import { useState, useEffect } from 'react';
import styles from './Daily.module.css';
import Table from '../../components/Table';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useLeaveStore } from '../../store/leaveStore';

const Daily = () => {
  const { 
    attendanceRecords, 
    engineers, 
    fetchAttendanceData, 
    batchCheckIn, 
    batchCancelCheckIn,
    siteCheckReports,
    fetchSiteCheckReport,
    isLoading,
    error
  } = useAttendanceStore();
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
  const [selectedSite, setSelectedSite] = useState<'新竹' | '台中' | '高雄'>('新竹');

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  // 當日期或站點變更時，獲取站點檢查報告
  useEffect(() => {
    // 將選定的日期轉換為 UTC 格式
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    const utcStartDate = startDate.toISOString();
    
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);
    const utcEndDate = endDate.toISOString();
    
    fetchSiteCheckReport(selectedSite, utcStartDate, utcEndDate);
  }, [selectedDate, selectedSite]);

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

  // 取消打卡功能
  const handleBatchCancelCheckIn = () => {
    if (selectedEids.length > 0) {
      batchCancelCheckIn(selectedEids);
      setSelectedEids([]);
      setSelectAll(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedEids([]);
    setSelectAll(false);
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSite(e.target.value as '新竹' | '台中' | '高雄');
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
    
    // 從 siteCheckReports 中查找對應的記錄
    const siteReport = siteCheckReports.find(report => 
      report.useraccount === record.account
    );
    
    // 如果有站點報告，使用報告中的狀態和時間
    const status = siteReport?.checkstatus === 'Checked-in' 
      ? 'Checked-in' 
      : record.status;
    
    const time = siteReport?.checktime 
      ? new Date(siteReport.checktime).toLocaleTimeString() 
      : record.time;
    
    return {
      ...record,
      department: engineer?.department || '',
      status,
      time,
      agent: siteReport?.agent || record.proxy || ''
    };
  });

  // 過濾數據
  const filteredData = tableData.filter(record => {
    // 只顯示選定站點的記錄
    if (record.site !== selectedSite) return false;
    
    // 搜尋關鍵字
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      return (
        record.name.toLowerCase().includes(keyword) ||
        record.account.toLowerCase().includes(keyword) ||
        record.eid.toLowerCase().includes(keyword) ||
        record.department.toLowerCase().includes(keyword)
      );
    }
    return true;
  });

  // 表格列定義
  const columns = [
    {
      title: '選擇',
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
    { 
      title: '簽到時間', 
      key: 'time',
      render: (record: any) => record.time || '-'
    },
    { 
      title: '代理人', 
      key: 'agent',
      render: (record: any) => {
        if (record.status !== 'Leave') return '-';
        return record.agent ? getProxyName(record.agent) : '-';
      }
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
          <div className={styles.siteFilter}>
            <label>選擇站點：</label>
            <select 
              value={selectedSite}
              onChange={handleSiteChange}
              className={styles.siteSelect}
            >
              <option value="新竹">新竹</option>
              <option value="台中">台中</option>
              <option value="高雄">高雄</option>
            </select>
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
          <button 
            className={`${styles.actionButton} ${styles.cancelButton}`}
            onClick={handleBatchCancelCheckIn}
            disabled={selectedEids.length === 0}
          >
            取消打卡
          </button>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

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
        {isLoading ? (
          <div className={styles.loading}>載入中...</div>
        ) : (
          <Table 
            columns={columns} 
            data={filteredData} 
          />
        )}
      </div>
    </div>
  );
};

export default Daily;
