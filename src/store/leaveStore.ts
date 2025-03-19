import { create } from 'zustand';

export interface LeaveRecord {
  account: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  proxy: string | null;
}

interface LeaveState {
  leaveRecords: LeaveRecord[];
  addLeaveRecord: (record: LeaveRecord) => void;
  removeLeaveRecord: (account: string, date: string) => void;
}

// 模擬請假資料
const mockLeaveRecords: LeaveRecord[] = [
  {
    account: 'roni123',
    date: '2025-03-20',
    startTime: '08:00',
    endTime: '12:00',
    reason: '個人事務',
    proxy: 'john123'
  }
];

export const useLeaveStore = create<LeaveState>((set) => ({
  leaveRecords: mockLeaveRecords,
  
  addLeaveRecord: (record) => {
    set(state => ({
      leaveRecords: [...state.leaveRecords, record]
    }));
  },
  
  removeLeaveRecord: (account, date) => {
    set(state => ({
      leaveRecords: state.leaveRecords.filter(
        record => !(record.account === account && record.date === date)
      )
    }));
  }
})); 