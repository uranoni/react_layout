import { useState, useEffect } from 'react';
import styles from './Summary.module.css';
import { attendanceAPI } from '../../api/api';

// 假資料類型定義
interface SiteCheckData {
  username: string;
  date: string;
  status: 'checkin' | 'pending' | 'leave';
  leaveType?: 'personal leave' | 'sick leave'; // 請假類型
  phone?: string; // 電話號碼
  department?: string; // 部門
}

// 員工詳細資訊彈窗資料
interface EmployeeDetail {
  username: string;
  phone: string;
  department: string;
  date: string;
  status: string;
  leaveType?: string;
}

const Summary = () => {
  const [selectedSite, setSelectedSite] = useState('新竹');
  const [timeRangeType, setTimeRangeType] = useState<'month' | 'range'>('range');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(7);
  const [startDate, setStartDate] = useState('2025/07/01');
  const [endDate, setEndDate] = useState('2025/07/23');
  const [heatmapData, setHeatmapData] = useState<SiteCheckData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetail | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // 生成假資料 (重新啟用用於測試)
  const generateMockData = (): SiteCheckData[] => {
    const users = [
      { name: '張宇喬', phone: '0912-345-678', department: 'IOCD-1' },
      { name: '葉銘鎔', phone: '0912-456-789', department: 'IOCD-1' },
      { name: '黃俊豪', phone: '0912-567-890', department: 'IOCD-1' },
      { name: '謝清華', phone: '0912-678-901', department: 'IOCD-1' },
      { name: '吳建勳', phone: '0912-789-012', department: 'IOCD-1' },
      { name: '王昱凱', phone: '0912-890-123', department: 'IOCD-1' },
      { name: '陳政隆', phone: '0912-901-234', department: 'IOCD-1' }
    ];
    
    // 生成 7/1 到 7/23 的日期
    const generateDates = (): string[] => {
      const dates: string[] = [];
      for (let day = 1; day <= 23; day++) {
        const dateStr = `2025-07-${String(day).padStart(2, '0')}`;
        dates.push(dateStr);
      }
      return dates;
    };
    
    const dates = generateDates();
    const statuses: ('checkin' | 'pending' | 'leave')[] = ['checkin', 'pending', 'leave'];
    const leaveTypes: ('personal leave' | 'sick leave')[] = ['personal leave', 'sick leave'];
    
    const mockData: SiteCheckData[] = [];
    
    users.forEach(user => {
      dates.forEach(date => {
        // 隨機生成狀態，但確保有各種狀態的展示
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const leaveType = randomStatus === 'leave' 
          ? leaveTypes[Math.floor(Math.random() * leaveTypes.length)]
          : undefined;
        
        mockData.push({
          username: user.name,
          date,
          status: randomStatus,
          leaveType,
          phone: user.phone,
          department: user.department
        });
      });
    });
    
    return mockData;
  };

  // 時間格式轉換函數
  const formatDateForAPI = (dateStr: string): string => {
    // 將 "2025/07/01" 格式轉換為 "2025-07-01" 格式
    return dateStr.replace(/\//g, '-');
  };

  // 生成月份的開始和結束日期
  const getMonthRange = (year: number, month: number): { startDate: string, endDate: string } => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0); // 獲取該月的最後一天
    
    const formatDate = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    return {
      startDate: formatDate(start),
      endDate: formatDate(end)
    };
  };

  // 處理查詢
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      console.log('使用 Mock Data 進行測試');
      
      // === 暫時使用 Mock Data ===
      const mockData = generateMockData();
      setHeatmapData(mockData);
      
      // === 真實 API 調用 (暫時註解) ===
      // 準備API參數
      // let apiStartDate: string;
      // let apiEndDate: string;
      // 
      // if (timeRangeType === 'month') {
      //   // 使用年月範圍
      //   const monthRange = getMonthRange(selectedYear, selectedMonth);
      //   apiStartDate = monthRange.startDate;
      //   apiEndDate = monthRange.endDate;
      // } else {
      //   // 使用自定義日期範圍
      //   apiStartDate = formatDateForAPI(startDate);
      //   apiEndDate = formatDateForAPI(endDate);
      // }
      // 
      // const apiParams = {
      //   site: selectedSite,
      //   startDate: apiStartDate,
      //   endDate: apiEndDate
      // };
      // 
      // console.log('發送API請求，參數:', apiParams);
      // 
      // // 調用真實API
      // const response = await attendanceAPI.getSiteCheckData(apiParams);
      // console.log('API響應:', response);
      // 
      // // 將API響應轉換為熱力圖數據格式
      // const transformedData: SiteCheckData[] = [];
      // if (response && Array.isArray(response)) {
      //   response.forEach((item: any) => {
      //     transformedData.push({
      //       username: item.username || item.useraccount || item.name || '未知用戶',
      //       date: item.date || item.updatedate || '',
      //       status: item.status || 'pending'
      //     });
      //   });
      // }
      // 
      // setHeatmapData(transformedData);
      
    } catch (error) {
      console.error('查詢失敗:', error);
      // 在錯誤情況下清空數據
      setHeatmapData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入資料
  useEffect(() => {
    // 頁面載入時執行一次查詢
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 獲取唯一的用戶列表和日期列表
  const uniqueUsers = [...new Set(heatmapData.map(item => item.username))];
  const uniqueDates = [...new Set(heatmapData.map(item => item.date))].sort();

  // 獲取特定用戶和日期的狀態
  const getStatus = (username: string, date: string): 'checkin' | 'pending' | 'leave' | null => {
    const record = heatmapData.find(item => item.username === username && item.date === date);
    return record ? record.status : null;
  };

  // 獲取員工詳細資料
  const getEmployeeData = (username: string, date: string): SiteCheckData | null => {
    return heatmapData.find(item => item.username === username && item.date === date) || null;
  };

  // 處理格子點擊事件
  const handleCellClick = (username: string, date: string) => {
    const employeeData = getEmployeeData(username, date);
    if (employeeData) {
      const statusText = employeeData.status === 'leave' && employeeData.leaveType 
        ? `請假 (${employeeData.leaveType})`
        : employeeData.status === 'checkin' ? '已簽到'
        : employeeData.status === 'pending' ? '未簽到'
        : employeeData.status;

      setSelectedEmployee({
        username: employeeData.username,
        phone: employeeData.phone || '未提供',
        department: employeeData.department || '未知部門',
        date: date,
        status: statusText,
        leaveType: employeeData.leaveType
      });
      setShowEmployeeModal(true);
    }
  };

  // 獲取 hover 顯示文字
  const getHoverText = (username: string, date: string): string => {
    const employeeData = getEmployeeData(username, date);
    if (!employeeData) return `${username} - ${date}: No data`;
    
    const statusText = employeeData.status === 'leave' && employeeData.leaveType 
      ? `請假 (${employeeData.leaveType})`
      : employeeData.status === 'checkin' ? '已簽到'
      : employeeData.status === 'pending' ? '未簽到'
      : employeeData.status;
    
    return `${username} (${employeeData.department}) - ${date}: ${statusText}`;
  };

  // 獲取狀態對應的CSS類
  const getStatusClass = (status: 'checkin' | 'pending' | 'leave' | null): string => {
    switch (status) {
      case 'checkin': return styles.checkinCell;
      case 'pending': return styles.pendingCell;
      case 'leave': return styles.leaveCell;
      default: return styles.emptyCell;
    }
  };

  return (
    <div className={styles.container}>
      {/* 查詢條件區域 */}
      <div className={styles.querySection}>
        <div className={styles.queryRow}>
          {/* Site選擇 */}
          <div className={styles.formGroup}>
            <label>站點</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className={styles.select}
            >
              <option value="新竹">新竹</option>
              <option value="台中">台中</option>
              <option value="高雄">高雄</option>
            </select>
          </div>

          {/* 時間範圍類型選擇 */}
          <div className={styles.formGroup}>
            <label>時間範圍</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="timeRangeType"
                  value="month"
                  checked={timeRangeType === 'month'}
                  onChange={(e) => setTimeRangeType(e.target.value as 'month' | 'range')}
                />
                年月
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="timeRangeType"
                  value="range"
                  checked={timeRangeType === 'range'}
                  onChange={(e) => setTimeRangeType(e.target.value as 'month' | 'range')}
                />
                日期區間
              </label>
            </div>
          </div>
        </div>

        <div className={styles.queryRow}>
          {timeRangeType === 'month' ? (
            <>
              <div className={styles.formGroup}>
                <label>年份</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className={styles.input}
                  min="2020"
                  max="2030"
                />
              </div>
              <div className={styles.formGroup}>
                <label>月份</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className={styles.select}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}月
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label>開始日期</label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.input}
                  placeholder="2025/07/01"
                />
              </div>
              <div className={styles.formGroup}>
                <label>結束日期</label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.input}
                  placeholder="2025/07/23"
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <button
              onClick={handleSearch}
              className={styles.searchButton}
              disabled={isLoading}
            >
              {isLoading ? '查詢中...' : '查詢'}
            </button>
          </div>
        </div>
      </div>

      {/* 熱力圖區域 */}
      <div className={styles.heatmapSection}>
        {/* 顏色圖例 */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.checkinLegend}`}></div>
            <span>已簽到 (checkin)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.pendingLegend}`}></div>
            <span>未簽到 (pending)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.leaveLegend}`}></div>
            <span>請假 (personal/sick leave)</span>
          </div>
        </div>

        {/* 熱力圖 */}
        {heatmapData.length > 0 ? (
          <div className={styles.heatmapWrapper}>
            <div className={styles.heatmapContainer}>
              {/* 表頭 - 日期 */}
              <div className={styles.heatmapHeader}>
                <div className={styles.userNameHeader}>使用者</div>
                <div className={styles.datesHeader}>
                  {uniqueDates.map(date => (
                    <div key={date} className={styles.dateCell}>
                      {date.split('-').slice(1).join('/')}
                    </div>
                  ))}
                </div>
              </div>

              {/* 熱力圖內容 */}
              <div className={styles.heatmapContent}>
                {uniqueUsers.map(username => (
                  <div key={username} className={styles.userRow}>
                    <div className={styles.userName}>{username}</div>
                    <div className={styles.statusCells}>
                      {uniqueDates.map(date => {
                        const status = getStatus(username, date);
                        return (
                          <div
                            key={`${username}-${date}`}
                            className={`${styles.statusCell} ${getStatusClass(status)} ${styles.clickableCell}`}
                            title={getHoverText(username, date)}
                            onClick={() => handleCellClick(username, date)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noData}>
            {isLoading ? '載入中...' : '暫無資料'}
          </div>
        )}
      </div>

      {/* 員工詳細資訊彈窗 */}
      {showEmployeeModal && selectedEmployee && (
        <div className={styles.modalOverlay} onClick={() => setShowEmployeeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>詳細資訊</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowEmployeeModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoRow}>
                <span className={styles.label}>姓名：</span>
                <span className={styles.value}>{selectedEmployee.username}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>部門：</span>
                <span className={styles.value}>{selectedEmployee.department}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>電話：</span>
                <span className={styles.value}>{selectedEmployee.phone}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>日期：</span>
                <span className={styles.value}>{selectedEmployee.date}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>狀態：</span>
                <span className={styles.value}>{selectedEmployee.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary; 