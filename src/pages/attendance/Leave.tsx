import { useState, useEffect } from 'react';
import styles from './Leave.module.css';
import Table from '../../components/Table';
import Alert from '../../components/Alert';
import { useLeaveStore } from '../../store/leaveStore';
import { useAttendanceStore } from '../../store/attendanceStore';

const Leave = () => {
  const { leaveRecords, addLeaveRecord, removeLeaveRecord, fetchLeaveRecords, isLoading, error } = useLeaveStore();
  const { engineers } = useAttendanceStore();
  const [showModal, setShowModal] = useState(false);
  
  // Alert 相關狀態
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info' as const
  });
  
  // 使用當地時區格式化日期
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = formatDate(new Date());
  
  // 日期範圍狀態
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today
  });
  
  const [formData, setFormData] = useState({
    account: '',
    date: today,
    startDateTime: `${today}T09:00`,
    endDateTime: `${today}T18:00`,
    reason: '',
    proxy: ''
  });

  // 初始載入時獲取當天的請假資料
  useEffect(() => {
    fetchLeaveRecords(dateRange.startDate, dateRange.endDate);
  }, []);

  // 獲取員工名稱
  const getEmployeeName = (account: string) => {
    const engineer = engineers.find(eng => eng.account === account);
    return engineer ? engineer.name : account;
  };

  // 處理日期範圍變更
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 查詢按鈕處理
  const handleSearch = () => {
    if (dateRange.startDate && dateRange.endDate) {
      if (dateRange.startDate > dateRange.endDate) {
        setAlertConfig({
          isOpen: true,
          title: '日期範圍錯誤',
          message: '開始日期不能晚於結束日期！',
          onConfirm: () => {
            setAlertConfig(prev => ({ ...prev, isOpen: false }));
          },
          type: 'error'
        });
        return;
      }
      fetchLeaveRecords(dateRange.startDate, dateRange.endDate);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 如果修改的是開始日期時間，同時更新日期欄位
    if (name === 'startDateTime') {
      const dateOnly = value.split('T')[0];
      setFormData({
        ...formData,
        [name]: value,
        date: dateOnly
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addLeaveRecord(formData);
      
      // 成功提交後顯示成功訊息
      setAlertConfig({
        isOpen: true,
        title: '請假申請成功',
        message: '您的請假申請已成功提交！',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        },
        type: 'success'
      });
      
      setShowModal(false);
      // 重置表單
      setFormData({
        account: '',
        date: today,
        startDateTime: `${today}T09:00`,
        endDateTime: `${today}T18:00`,
        reason: '',
        proxy: ''
      });
      
      // 重新獲取請假資料
      fetchLeaveRecords(dateRange.startDate, dateRange.endDate);
    } catch (error) {
      // 錯誤處理已在 store 中完成，這裡可以顯示錯誤訊息
      console.error('提交請假申請失敗:', error);
    }
  };

  const handleCancel = (account: string, date: string) => {
    setAlertConfig({
      isOpen: true,
      title: '取消請假確認',
      message: '確定要取消此請假申請嗎？',
      onConfirm: () => {
        removeLeaveRecord(account, date);
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
      },
      type: 'warning'
    });
  };

  // 格式化日期時間顯示
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    { title: '員工帳號', key: 'account' },
    { 
      title: '員工姓名', 
      key: 'name',
      render: (record: any) => getEmployeeName(record.account)
    },
    { 
      title: '開始時間', 
      key: 'startDateTime',
      render: (record: any) => formatDateTime(record.startDateTime)
    },
    { 
      title: '結束時間', 
      key: 'endDateTime',
      render: (record: any) => formatDateTime(record.endDateTime)
    },
    { title: '請假原因', key: 'reason' },
    { 
      title: '代理人', 
      key: 'proxy',
      render: (record: any) => record.proxy ? getEmployeeName(record.proxy) : '-'
    },
    { 
      title: '操作', 
      key: 'actions',
      render: (record: any) => (
        <button 
          className={styles.cancelBtn}
          onClick={() => handleCancel(record.account, record.date)}
        >
          取消
        </button>
      )
    }
  ];

  return (
    <div className={styles.container}>
      {/* Alert 組件 */}
      <Alert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        type={alertConfig.type}
        confirmText="確認"
        cancelText="取消"
      />

      {/* 頂部操作區 */}
      <div className={styles.actionBar}>
        <div className={styles.leftActions}>
          <h1 className={styles.title}>請假管理</h1>
          
          {/* 日期範圍選擇 */}
          <div className={styles.dateRangeFilter}>
            <div className={styles.dateFilter}>
              <label>開始日期:</label>
              <input 
                type="date" 
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.dateFilter}>
              <label>結束日期:</label>
              <input 
                type="date" 
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className={styles.dateInput}
              />
            </div>
            <button 
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? '查詢中...' : '查詢'}
            </button>
          </div>
        </div>
        
        <div className={styles.rightActions}>
          <button 
            className={styles.addButton}
            onClick={() => setShowModal(true)}
            disabled={isLoading}
          >
            新增請假
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
          <span className={styles.statLabel}>總請假數</span>
          <span className={styles.statValue}>{leaveRecords.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>查詢範圍</span>
          <span className={styles.statValue}>
            {dateRange.startDate} ~ {dateRange.endDate}
          </span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loading}>載入中...</div>
        ) : (
          <Table columns={columns} data={leaveRecords} />
        )}
      </div>

      {/* 新增請假模態框 */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>新增請假申請</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
                disabled={isLoading}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>員工帳號</label>
                <select 
                  name="account" 
                  value={formData.account} 
                  onChange={handleInputChange}
                  required
                  className={styles.select}
                  disabled={isLoading}
                >
                  <option value="">請選擇員工</option>
                  {engineers.map(eng => (
                    <option key={eng.account} value={eng.account}>
                      {eng.account} ({eng.name})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>開始時間</label>
                  <input 
                    type="datetime-local" 
                    name="startDateTime" 
                    value={formData.startDateTime} 
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                    disabled={isLoading}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>結束時間</label>
                  <input 
                    type="datetime-local" 
                    name="endDateTime" 
                    value={formData.endDateTime} 
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>請假原因</label>
                <textarea 
                  name="reason" 
                  value={formData.reason} 
                  onChange={handleInputChange}
                  required
                  className={styles.textarea}
                  disabled={isLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>代理人帳號</label>
                <select 
                  name="proxy" 
                  value={formData.proxy} 
                  onChange={handleInputChange}
                  required
                  className={styles.select}
                  disabled={isLoading}
                >
                  <option value="">請選擇代理人</option>
                  {engineers
                    .filter(eng => eng.account !== formData.account)
                    .map(eng => (
                      <option key={eng.account} value={eng.account}>
                        {eng.account} ({eng.name})
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isLoading}
                >
                  {isLoading ? '提交中...' : '提交'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave; 