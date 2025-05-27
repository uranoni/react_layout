import { create } from 'zustand';
import { attendanceAPI } from '../api/api';

export interface LeaveRecord {
  account: string;
  date: string;
  startDateTime: string;
  endDateTime: string;
  reason: string;
  proxy: string | null;
}

interface LeaveState {
  leaveRecords: LeaveRecord[];
  isLoading: boolean;
  error: string | null;
  addLeaveRecord: (record: LeaveRecord) => Promise<void>;
  removeLeaveRecord: (account: string, date: string) => void;
  fetchLeaveRecords: (startDate: string, endDate: string) => Promise<void>;
}

// 模擬請假資料
const mockLeaveRecords: LeaveRecord[] = [
  {
    account: 'roni123',
    date: '2025-03-20',
    startDateTime: '2025-03-20T08:00',
    endDateTime: '2025-03-20T12:00',
    reason: '個人事務',
    proxy: 'john123'
  }
];

export const useLeaveStore = create<LeaveState>((set, get) => ({
  leaveRecords: mockLeaveRecords,
  isLoading: false,
  error: null,
  
  addLeaveRecord: async (record) => {
    set({ isLoading: true, error: null });
    
    try {
      // 準備 API 請求數據
      const leaveData = {
        account: record.account,
        startDateTime: record.startDateTime,
        endDateTime: record.endDateTime,
        proxyName: record.proxy || '',
        reason: record.reason
      };
      
      // 調用 API
      await attendanceAPI.submitLeaveRequest(leaveData);
      
      // API 成功後，更新本地狀態
      set(state => ({
        leaveRecords: [...state.leaveRecords, record],
        isLoading: false
      }));
      
    } catch (error) {
      console.error('提交請假申請失敗:', error);
      set({ 
        error: error instanceof Error ? error.message : '提交請假申請失敗', 
        isLoading: false 
      });
      throw error; // 重新拋出錯誤，讓組件可以處理
    }
  },
  
  removeLeaveRecord: (account, date) => {
    set(state => ({
      leaveRecords: state.leaveRecords.filter(
        record => !(record.account === account && record.date === date)
      )
    }));
  },

  // 新增獲取請假資料的方法
  fetchLeaveRecords: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await attendanceAPI.getLeaveRecords(startDate, endDate);
      console.log('API 返回的請假資料:', data);
      
      // 確保數據是數組
      const leaveData = Array.isArray(data) ? data : [];
      
      set({ 
        leaveRecords: leaveData, 
        isLoading: false 
      });
      
    } catch (error) {
      console.error('獲取請假資料失敗:', error);
      set({ 
        error: error instanceof Error ? error.message : '獲取請假資料失敗', 
        isLoading: false 
      });
    }
  }
})); 