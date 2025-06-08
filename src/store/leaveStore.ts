// @ts-nocheck
import { create } from 'zustand';
import { getSameEmployers, attendanceAPI } from '../api/api';

// 類型定義
export interface Colleague {
  useraccount: string;
  username: string;
}

export interface LeaveRecord {
  id: number;
  account: string;
  startDateTime: string;
  endDateTime: string;
  proxyaccount: string | null;
  reason: string;
  accountName?: string;
  proxyName?: string | null;
}

export interface LeaveRequest {
  account: string;
  startDateTime: string;
  endDateTime: string;
  reason: string;
  proxy?: string;
}

interface LeaveState {
  // 請假記錄
  leaveRecords: LeaveRecord[];
  // 同事資訊
  colleagues: Colleague[];
  // 載入狀態
  isLoading: boolean;
  isLoadingColleagues: boolean;
  isSubmitting: boolean;
  // 錯誤狀態
  error: string | null;
  
  // Actions
  fetchLeaveRecords: (startDate: string, endDate: string) => Promise<void>;
  addLeaveRecord: (record: Omit<LeaveRecord, 'id'>) => Promise<void>;
  removeLeaveRecord: (account: string, date: string) => Promise<void>;
  cancelLeave: (id: number) => Promise<void>;
  fetchColleagues: () => Promise<void>;
  submitLeave: (leaveData: LeaveRequest) => Promise<void>;
  clearError: () => void;
}

export const useLeaveStore = create<LeaveState>((set) => ({
  leaveRecords: [],
  colleagues: [],
  isLoading: false,
  isLoadingColleagues: false,
  isSubmitting: false,
  error: null,
  
  fetchLeaveRecords: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('查詢請假記錄，日期範圍:', { startDate, endDate });
      const records = await attendanceAPI.getLeaveRecords(startDate, endDate);
      console.log('API 回傳的請假記錄:', records);
      
      // 確保資料格式正確
      const formattedRecords = records.map((record: any) => ({
        id: record.id,
        account: record.account,
        startDateTime: record.startDateTime,
        endDateTime: record.endDateTime,
        proxyaccount: record.proxyaccount || null,
        reason: record.reason,
        accountName: record.accountName || record.account,
        proxyName: record.proxyName || record.proxyaccount || null
      }));
      
      set({ leaveRecords: formattedRecords });
    } catch (error) {
      console.error('獲取請假記錄失敗:', error);
      const errorMessage = error instanceof Error ? error.message : '獲取請假記錄失敗';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addLeaveRecord: async (record: Omit<LeaveRecord, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newRecord = { ...record, id: Date.now() };
      set(state => ({
        leaveRecords: [...state.leaveRecords, newRecord as LeaveRecord]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '新增請假記錄失敗';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeLeaveRecord: async (account: string, date: string) => {
    set({ isLoading: true, error: null });
    try {
      set(state => ({
        leaveRecords: state.leaveRecords.filter(
          record => !(record.account === account && record.startDateTime.includes(date))
        )
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '刪除請假記錄失敗';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelLeave: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      console.log('取消請假，ID:', id);
      await attendanceAPI.cancelLeave(id);
      
      // 從本地狀態中移除該記錄
      set(state => ({
        leaveRecords: state.leaveRecords.filter(record => record.id !== id)
      }));
    } catch (error) {
      console.error('取消請假失敗:', error);
      const errorMessage = error instanceof Error ? error.message : '取消請假失敗';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchColleagues: async () => {
    set({ isLoadingColleagues: true, error: null });
    try {
      const colleagues = await getSameEmployers();
      set({ colleagues });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '獲取同事資訊失敗';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoadingColleagues: false });
    }
  },

  submitLeave: async (leaveData: LeaveRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      // 轉換參數格式以符合後端 API
      const apiData = {
        account: leaveData.account,
        startDateTime: leaveData.startDateTime,
        endDateTime: leaveData.endDateTime,
        proxyName: leaveData.proxy || '',
        reason: leaveData.reason
      };
      
      const newRecord = await attendanceAPI.submitLeaveRequest(apiData);
      set(state => ({
        leaveRecords: [...state.leaveRecords, newRecord]
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提交請假申請失敗';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  clearError: () => set({ error: null })
})); 