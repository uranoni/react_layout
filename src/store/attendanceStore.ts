import create from 'zustand';

interface AttendanceRecord {
  site: string;
  name: string;
  eid: string;
  status: string;
}

interface AttendanceState {
  attendanceData: AttendanceRecord[];
  fetchAttendanceData: () => void;
  updateStatus: (eid: string, status: string) => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  attendanceData: [],
  fetchAttendanceData: () => {
    // 模擬從伺服器獲取資料
    const data: AttendanceRecord[] = [
      { site: 'taipei', name: '張三', eid: '001', status: '未簽到' },
      { site: 'taipei', name: '李四', eid: '002', status: '已簽到' },
      { site: 'taipei', name: '王五', eid: '003', status: '請假' },
      { site: 'taipei', name: '趙六', eid: '004', status: '未簽到' },
    ];
    set({ attendanceData: data });
  },
  updateStatus: (eid, status) => {
    set((state) => ({
      attendanceData: state.attendanceData.map((record) =>
        record.eid === eid ? { ...record, status } : record
      ),
    }));
  },
}));
