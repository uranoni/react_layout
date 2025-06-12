import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { keycloakConfig } from '../config/keycloak.config';

// 創建 axios 實例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 從 localStorage 獲取 token
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

// 設置 token 到 localStorage
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// 清除 token
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // 如果是 401 錯誤且不是重試請求
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 嘗試刷新 token
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // 呼叫您的 refresh token API
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // 更新 localStorage 中的 token
        setTokens(accessToken, newRefreshToken);
        
        // 更新請求頭並重試
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        };
        
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新失敗，清除 token
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API 方法
export const authAPI = {
  // 本地登入
  login: async (username: string, password: string) => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },

  // SSO 登入
  ssoLogin: async () => {
    const sso_token = localStorage.getItem('sso_accesstoken');
    const response = await api.get('/sso_token', {
      headers: {
        'sso_url': keycloakConfig.url,
        'sso_authorization': sso_token,
        'sso_access_token': sso_token
      }
    });
    return response.data;
  },

  // 獲取應用程式 tokens
  getAppTokens: async (headers: {
    sso_url: string;
    sso_authorization: string;
    sso_access_token: string;
  }) => {
    const response = await api.get('/sso_token', { headers });
    return response.data;
  },
  
  refresh: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken, user } = response.data;
      
      // 更新 localStorage 中的 token
      setTokens(accessToken, newRefreshToken);
      
      return { user };
    } catch (error) {
      clearTokens();
      return null;
    }
  },
  
  logout: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    clearTokens();
  },
  
  getUserProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
};

// 出勤相關 API
export const attendanceAPI = {
  getSiteCheckReport: async (date: string) => {
    try {
      console.log('發送請求到 /getdaily，參數:', { utcdate: date });
      const response = await api.post('/getdaily', { utcdate: date });
      console.log('API 響應:', response);
      return response.data;
    } catch (error) {
      console.error('獲取日報表失敗:', error);
      if (axios.isAxiosError(error)) {
        console.error('請求錯誤詳情:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },
  
  // 新增批次打卡/取消打卡 API
  batchSetCheck: async (useraccounts: string[], date: string, status: 'checkin' | 'pending') => {
    try {
      console.log('發送請求到 /setcheck，參數:', { useraccounts, date, status });
      const response = await api.post('/setcheck', {
        useraccounts,
        date,
        status
      });
      console.log('API 響應:', response);
      return response.data;
    } catch (error) {
      console.error('批次設置打卡狀態失敗:', error);
      if (axios.isAxiosError(error)) {
        console.error('請求錯誤詳情:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },

  // 新增請假申請 API
  submitLeaveRequest: async (leaveData: {
    account: string;
    startDateTime: string;
    endDateTime: string;
    proxyName: string;
    reason: string;
  }) => {
    try {
      console.log('發送請假申請到 /leave，參數:', leaveData);
      const response = await api.post('/applyleave', leaveData);
      console.log('請假申請 API 響應:', response);
      return response.data;
    } catch (error) {
      console.error('提交請假申請失敗:', error);
      if (axios.isAxiosError(error)) {
        console.error('請求錯誤詳情:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },

  // 新增獲取請假資料 API
  getLeaveRecords: async (startDate: string, endDate: string) => {
    try {
      console.log('發送請求到 /getLeaveRecords，參數:', { startDate, endDate });
      const response = await api.post('/getLeaveRecords', {
        startdate:startDate,
        enddate:endDate
      });
      console.log('獲取請假資料 API 響應:', response);
      return response.data;
    } catch (error) {
      console.error('獲取請假資料失敗:', error);
      if (axios.isAxiosError(error)) {
        console.error('請求錯誤詳情:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },

  // 新增取消請假 API
  cancelLeave: async (id: number) => {
    try {
      console.log('發送取消請假請求到 /cancelleave，參數:', { id });
      const response = await api.post('/cancelleave', { id });
      console.log('取消請假 API 響應:', response);
      return response.data;
    } catch (error) {
      console.error('取消請假失敗:', error);
      if (axios.isAxiosError(error)) {
        console.error('請求錯誤詳情:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  }
};

// 新增：獲取同單位同事 API
export const getSameEmployers = async () => {
  try {
    const response = await api.post('/getsameemployers');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || '獲取同事資訊失敗');
    }
    throw error;
  }
};

export default api; 