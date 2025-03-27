import { useState, useEffect } from 'react';
import styles from './Leave.module.css';
import Table from '../../components/Table';
import { useLeaveStore } from '../../store/leaveStore';
import { useAttendanceStore } from '../../store/attendanceStore';

const Leave = () => {
  const { leaveRecords, addLeaveRecord, removeLeaveRecord } = useLeaveStore();
  const { engineers } = useAttendanceStore();
  const [showModal, setShowModal] = useState(false);
  
  // 使用當地時區格式化日期
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = formatDate(new Date());
  
  const [formData, setFormData] = useState({
    account: '',
    date: today,
    startDateTime: `${today}T09:00`,
    endDateTime: `${today}T18:00`,
    reason: '',
    proxy: ''
  });

  // 獲取員工名稱
  const getEmployeeName = (account: string) => {
    const engineer = engineers.find(eng => eng.account === account);
    return engineer ? engineer.name : account;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLeaveRecord(formData);
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
  };

  const handleCancel = (account: string, date: string) => {
    if (window.confirm('確定要取消此請假申請嗎？')) {
      removeLeaveRecord(account, date);
    }
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
    { title: '請假日期', key: 'date' },
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
      key: 'proxyName',
      render: (record: any) => record.proxy ? getEmployeeName(record.proxy) : '-'
    },
    { 
      title: '操作', 
      key: 'actions',
      render: (record: any) => (
        <button 
          className={styles.cancelButton}
          onClick={() => handleCancel(record.account, record.date)}
        >
          取消請假
        </button>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.actionBar}>
        <button 
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-plus"></i>
          新增請假
        </button>
      </div>
      
      <div className={styles.tableWrapper}>
        <Table columns={columns} data={leaveRecords} />
      </div>

      {/* 請假表單彈窗 */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>新增請假申請</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
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
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                >
                  提交
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