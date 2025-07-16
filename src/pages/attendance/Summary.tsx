import { useState, useEffect } from 'react';
import styles from './Summary.module.css';

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

  // 生成假資料
  const generateMockData = (): SiteCheckData[] => {
    const users = ['張三', '李四', '王五', '陳六', '林七', '黃八', '周九', '吳十'];
    const dates = ['2025-07-01', '2025-07-02'];
    const statuses: ('checkin' | 'pending' | 'leave')[] = ['checkin', 'pending', 'leave'];
    
    const mockData: SiteCheckData[] = [];
    
    users.forEach(user => {
      dates.forEach(date => {
        // 隨機生成狀態，但確保有各種狀態的展示
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        mockData.push({
          username: user,
          date,
          status: randomStatus
        });
      });
    });
    
    return mockData;
  };

  // 處理查詢
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // 模擬API調用延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 使用假資料
      const mockData = generateMockData();
      setHeatmapData(mockData);
      
      console.log('查詢參數:', {
        site: selectedSite,
        timeRangeType,
        ...(timeRangeType === 'month' 
          ? { year: selectedYear, month: selectedMonth }
          : { startDate, endDate }
        )
      });
    } catch (error) {
      console.error('查詢失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入假資料
  useEffect(() => {
    handleSearch();
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