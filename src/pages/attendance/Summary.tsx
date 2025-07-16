import { useState, useEffect } from 'react';
import styles from './Summary.module.css';
import { attendanceAPI } from '../../api/api';

// 假資料類型定義
interface SiteCheckData {
  username: string;
  date: string;
  status: 'checkin' | 'pending' | 'leave';
}

const Summary = () => {
  const [selectedSite, setSelectedSite] = useState('新竹');
  const [timeRangeType, setTimeRangeType] = useState<'month' | 'range'>('range');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(7);
  const [startDate, setStartDate] = useState('2025/07/01');
  const [endDate, setEndDate] = useState('2025/07/02');
  const [heatmapData, setHeatmapData] = useState<SiteCheckData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 生成假資料 (已註解，改用真實API)
  // const generateMockData = (): SiteCheckData[] => {
  //   const users = ['張三', '李四', '王五', '陳六', '林七', '黃八', '周九', '吳十'];
  //   const dates = ['2025-07-01', '2025-07-02'];
  //   const statuses: ('checkin' | 'pending' | 'leave')[] = ['checkin', 'pending', 'leave'];
  //   
  //   const mockData: SiteCheckData[] = [];
  //   
  //   users.forEach(user => {
  //     dates.forEach(date => {
  //       // 隨機生成狀態，但確保有各種狀態的展示
  //       const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  //       mockData.push({
  //         username: user,
  //         date,
  //         status: randomStatus
  //       });
  //     });
  //   });
  //   
  //   return mockData;
  // };

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
      // 準備API參數
      let apiStartDate: string;
      let apiEndDate: string;
      
      if (timeRangeType === 'month') {
        // 使用年月範圍
        const monthRange = getMonthRange(selectedYear, selectedMonth);
        apiStartDate = monthRange.startDate;
        apiEndDate = monthRange.endDate;
      } else {
        // 使用自定義日期範圍
        apiStartDate = formatDateForAPI(startDate);
        apiEndDate = formatDateForAPI(endDate);
      }
      
      const apiParams = {
        site: selectedSite,
        startDate: apiStartDate,
        endDate: apiEndDate
      };
      
      console.log('發送API請求，參數:', apiParams);
      
      // 調用真實API
      const response = await attendanceAPI.getSiteCheckData(apiParams);
      console.log('API響應:', response);
      
      // 將API響應轉換為熱力圖數據格式
      const transformedData: SiteCheckData[] = [];
      if (response && Array.isArray(response)) {
        response.forEach((item: any) => {
          transformedData.push({
            username: item.username || item.useraccount || item.name || '未知用戶',
            date: item.date || item.updatedate || '',
            status: item.status || 'pending'
          });
        });
      }
      
      setHeatmapData(transformedData);
      
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
                  placeholder="2025/07/15"
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
            <span>請假 (leave)</span>
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
                            className={`${styles.statusCell} ${getStatusClass(status)}`}
                            title={`${username} - ${date}: ${status || 'No data'}`}
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
    </div>
  );
};

export default Summary; 