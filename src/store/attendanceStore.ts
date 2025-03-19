import { create } from 'zustand';
import { useLeaveStore } from './leaveStore';

export interface Engineer {
  account: string;
  name: string;
  eid: string;
  site: '新竹' | '台中' | '高雄';
  department: string;
}

export interface AttendanceRecord {
  date: string;
  time: string;
  account: string;
  name: string;
  eid: string;
  status: 'Checked-in' | 'Pending' | 'Leave';
  site: '新竹' | '台中' | '高雄';
  proxy?: string | null;
}

interface AttendanceState {
  engineers: Engineer[];
  attendanceRecords: AttendanceRecord[];
  fetchAttendanceData: (date?: string) => void;
  updateStatus: (eid: string, status: 'Checked-in' | 'Pending' | 'Leave') => void;
  batchCheckIn: (eids: string[]) => void;
}

// 模擬工程師資料
const mockEngineers: Engineer[] = [
  { account: 'john123', name: '張志明', eid: 'E001', site: '新竹', department: '軟體開發部' },
  { account: 'mary456', name: '王小明', eid: 'E002', site: '新竹', department: '系統整合部' },
  { account: 'peter789', name: '陳大文', eid: 'E003', site: '新竹', department: '測試部' },
  { account: 'lisa111', name: '林美玲', eid: 'E004', site: '台中', department: '軟體開發部' },
  { account: 'mike222', name: '吳建志', eid: 'E005', site: '台中', department: '系統整合部' },
  { account: 'sarah333', name: '黃雅琪', eid: 'E006', site: '台中', department: '測試部' },
  { account: 'david444', name: '劉俊宏', eid: 'E007', site: '高雄', department: '軟體開發部' },
  { account: 'emma555', name: '張淑芬', eid: 'E008', site: '高雄', department: '系統整合部' },
  { account: 'kevin666', name: '許志豪', eid: 'E009', site: '高雄', department: '測試部' },
  { account: 'roni123', name: '高雅婷', eid: 'E010', site: '新竹', department: '軟體開發部' },
];

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  engineers: mockEngineers,
  attendanceRecords: [],
  
  fetchAttendanceData: (date) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const leaveRecords = useLeaveStore.getState().leaveRecords;
    
    // 創建基本的出勤記錄
    const records = get().engineers.map(eng => {
      // 檢查是否有請假記錄
      const leaveRecord = leaveRecords.find(
        leave => leave.account === eng.account && leave.date === targetDate
      );
      
      return {
        date: targetDate,
        time: '',
        account: eng.account,
        name: eng.name,
        eid: eng.eid,
        status: leaveRecord ? 'Leave' as const : 'Pending' as const,
        site: eng.site,
        proxy: leaveRecord?.proxy || null
      };
    });
    
    set({ attendanceRecords: records });
  },
  
  updateStatus: (eid, status) => {
    set(state => ({
      attendanceRecords: state.attendanceRecords.map(record => {
        if (record.eid === eid) {
          // 如果是簽到，添加時間
          const time = status === 'Checked-in' ? new Date().toLocaleTimeString() : record.time;
          return { ...record, status, time };
        }
        return record;
      })
    }));
  },
  
  batchCheckIn: (eids) => {
    const now = new Date().toLocaleTimeString();
    
    set(state => ({
      attendanceRecords: state.attendanceRecords.map(record => {
        if (eids.includes(record.eid) && record.status !== 'Leave') {
          return { ...record, status: 'Checked-in', time: now };
        }
        return record;
      })
    }));
  }
}));
