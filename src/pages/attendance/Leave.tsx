import { useState, useEffect } from 'react';
import styles from './Leave.module.css';
import Table from '../../components/Table';
import Alert from '../../components/Alert';
import { useLeaveStore } from '../../store/leaveStore';
import { useAttendanceStore } from '../../store/attendanceStore';

const Leave = () => {
  const { leaveRecords, addLeaveRecord, removeLeaveRecord, isLoading, error } = useLeaveStore();
  const { engineers } = useAttendanceStore();
  const [showModal, setShowModal] = useState(false);
  
  // Alert 相關狀態
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'info' as const
  });
  
  // 格式化日期為 YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const today = formatDate(new Date());
  
  // 日期範圍狀態
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today
  });
  
  const [formData, setFormData] = useState({
    account: '',
    startDateTime: '',
    endDateTime: '',
    reason: '',
    proxy: ''
  });

  // 初始載入當天資料
  useEffect(() => {
    // 這裡可以添加初始載入邏輯
  }, []);

  // 處理日期範圍查詢
  const handleDateRangeSearch = async () => {
    if (dateRange.startDate > dateRange.endDate) {
      setAlertConfig({
        isOpen: true,
        title: '日期錯誤',
        message: '開始日期不能晚於結束日期',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        },
        type: 'info'
      });
      return;
    }
    
    // 這裡可以添加實際的查詢邏輯
    console.log('查詢日期範圍:', dateRange);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account || !formData.startDateTime || !formData.endDateTime || !formData.reason) {
      setAlertConfig({
        isOpen: true,
        title: '表單驗證',
        message: '請填寫所有必填欄位',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        },
        type: 'info'
      });
      return;
    }

    if (new Date(formData.startDateTime) >= new Date(formData.endDateTime)) {
      setAlertConfig({
        isOpen: true,
        title: '時間驗證',
        message: '開始時間必須早於結束時間',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        },
        type: 'info'
      });
      return;
    }

    try {
      const newRecord = {
        account: formData.account,
        date: formData.startDateTime.split('T')[0],
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        reason: formData.reason,
        proxy: formData.proxy || null
      };

      await addLeaveRecord(newRecord);
      
      setAlertConfig({
        isOpen: true,
        title: '成功',
        message: '請假申請已提交',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        },
        type: 'info'
      });
      
      setShowModal(false);
      setFormData({
        account: '',
        startDateTime: '',
        endDateTime: '',
        reason: '',
        proxy: ''
      });
      
    } catch (error) {
      console.error('提交請假申請失敗:', error);
    }
  };

  const handleDelete = (account: string, date: string) => {
    setAlertConfig({
      isOpen: true,
      title: '確認刪除',
      message: '確定要刪除這筆請假記錄嗎？',
      onConfirm: () => {
        removeLeaveRecord(account, date);
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
      },
      type: 'info'
    });
  };

  // 表格欄位定義
  const columns = [
    { key: 'account', title: '員工帳號' },
    { key: 'name', title: '員工姓名' },
    { key: 'startDateTime', title: '開始時間' },
    { key: 'endDateTime', title: '結束時間' },
    { key: 'reason', title: '請假原因' },
    { key: 'proxy', title: '代理人' },
    {
      key: 'actions',
      title: '操作',
      render: (value: any, record: any) => (
        <button
          onClick={() => handleDelete(record.account, record.date)}
          className={styles.cancelButton}
        >
          取消
        </button>
      )
    }
  ];

  // 統計資料
  const totalRecords = leaveRecords.length;
  const dateRangeText = `${dateRange.startDate} ~ ${dateRange.endDate}`;

  return (
    <div className={styles.container}>
      <h2>請假管理</h2>
      
      {/* 操作區域 */}
      <div className={styles.actionBar}>
        <div className={styles.leftActions}>
          <div className={styles.dateRangeFilter}>
            <div className={styles.dateFilter}>
              <span>開始日期:</span>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.dateFilter}>
              <span>結束日期:</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className={styles.dateInput}
              />
            </div>
            <button 
              onClick={handleDateRangeSearch}
              disabled={isLoading}
              className={styles.searchButton}
            >
              查詢
            </button>
          </div>
        </div>
        
        <div className={styles.rightActions}>
          <button 
            onClick={() => setShowModal(true)}
            className={styles.addButton}
          >
            新增請假
          </button>
        </div>
      </div>

      {/* 統計欄 */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>總請假數</span>
          <span className={styles.statValue}>{totalRecords}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>查詢範圍</span>
          <span className={styles.statValue}>{dateRangeText}</span>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* 載入中 */}
      {isLoading && (
        <div className={styles.loading}>
          載入中...
        </div>
      )}

      {/* 表格 */}
      <div className={styles.tableWrapper}>
        <Table 
          data={leaveRecords} 
          columns={columns}
        />
      </div>

      {/* Alert 組件 */}
      <Alert
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        type={alertConfig.type}
      />

      {/* 新增請假彈窗 */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>新增請假</h3>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>員工帳號 *</label>
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                    className={styles.select}
                    required
                  >
                    <option value="">請選擇員工</option>
                    {engineers.map(engineer => (
                      <option key={engineer.account} value={engineer.account}>
                        {engineer.name} ({engineer.account})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>代理人</label>
                  <select
                    value={formData.proxy}
                    onChange={(e) => setFormData(prev => ({ ...prev, proxy: e.target.value }))}
                    className={styles.select}
                  >
                    <option value="">請選擇代理人（可選）</option>
                    {engineers.map(engineer => (
                      <option key={engineer.account} value={engineer.account}>
                        {engineer.name} ({engineer.account})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>開始時間 *</label>
                  <input
                    type="datetime-local"
                    value={formData.startDateTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDateTime: e.target.value }))}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>結束時間 *</label>
                  <input
                    type="datetime-local"
                    value={formData.endDateTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDateTime: e.target.value }))}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>請假原因 *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className={styles.textarea}
                  placeholder="請輸入請假原因"
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelBtn}
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