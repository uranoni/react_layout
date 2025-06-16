import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { keycloakConfig } from '../config/keycloak.config';

// 創建 axios 實例
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_URL + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 創建一個不經過攔截器的 axios 實例，專門用於 refresh
const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_APP_URL + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 從 localStorage 獲取 token
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

// 設置 token 到 localStorage
export const setTokens = (accessToken: string, refreshToken: string) => {
  console.log('設置 tokens:', { accessToken: accessToken ? 'exists' : 'null', refreshToken: refreshToken ? 'exists' : 'null' });
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// 清除 token
export const clearTokens = () => {
  console.log('清除所有 tokens');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
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
      console.log('收到 401 錯誤，嘗試刷新 token');
      
      try {
        // 檢查是否是 SSO 登入
        const ssoIdToken = localStorage.getItem('sso_idtoken');
        const ssoAccessToken = localStorage.getItem('sso_accesstoken');
        
        console.log('檢查 SSO 狀態:', { 
          hasSsoIdToken: !!ssoIdToken, 
          hasSsoAccessToken: !!ssoAccessToken 
        });
        
        if (ssoIdToken && ssoAccessToken) {
          console.log('SSO 登入 - 重新獲取應用 token');
          // 如果是 SSO 登入，嘗試重新獲取應用 token
          const response = await authAPI.ssoLogin();
          console.log('SSO 登入響應:', response);
          
          const { access_token: accessToken, refresh_token: refreshToken } = response;
          
          if (!accessToken || !refreshToken) {
            console.error('SSO 登入響應缺少必要的 tokens:', { accessToken, refreshToken });
            throw new Error('SSO 登入響應缺少必要的 tokens');
          }
          
          // 更新 localStorage 中的 token
          setTokens(accessToken, refreshToken);
          
          // 更新請求頭並重試
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${accessToken}`,
          };
          
          return api(originalRequest);
        } else {
          console.log('本地登入 - 使用 refresh token');
          // 本地登入的情況，使用統一的 refresh 函數
          const refreshResult = await authAPI.refresh();
          
          if (!refreshResult || !refreshResult.access_token || !refreshResult.refresh_token) {
            console.error('Refresh token 失敗或響應無效');
            throw new Error('Refresh token failed');
          }
          
          console.log('本地登入 - refresh token 成功');
          
          // 更新請求頭並重試
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${refreshResult.access_token}`,
          };
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token 刷新失敗:', refreshError);
        // 刷新失敗，清除 token
        clearTokens();
        // 只有在非 SSO 登入的情況下才重定向到登入頁
        if (!localStorage.getItem('sso_idtoken')) {
          console.log('重定向到登入頁');
          window.location.href = '/login';
        } else {
          console.log('SSO 登入失敗，但不重定向到登入頁');
        }
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
    // 從 localStorage 獲取 SSO tokens
    const sso_idtoken = localStorage.getItem('sso_idtoken');
    const sso_accesstoken = localStorage.getItem('sso_accesstoken');
    const sso_refreshtoken = localStorage.getItem('sso_refreshtoken');

    if (!sso_idtoken || !sso_accesstoken || !sso_refreshtoken) {
      throw new Error('SSO tokens not found');
    }

    // 使用 SSO tokens 獲取應用 tokens
    const response = await api.get('/sso_token', {
      headers: {
        'sso_url': keycloakConfig.url,
        'sso_idtoken': sso_idtoken,
        'sso_accesstoken': sso_accesstoken,
        'sso_refreshtoken': sso_refreshtoken
      }
    });
    return response.data;
  },

  // 獲取應用程式 tokens
  getAppTokens: async (headers: {
    sso_url: string;
    sso_idtoken: string;
    sso_accesstoken: string;
    sso_refreshtoken: string;
  }) => {
    const response = await api.get('/sso_token', { headers });
    return response.data;
  },
  
  refresh: async () => {
    const refreshToken = getRefreshToken();
    console.log('authAPI.refresh 被調用，refresh token:', refreshToken ? 'exists' : 'null');
    
    if (!refreshToken) {
      console.log('authAPI.refresh: 沒有 refresh token，返回 null');
      return null;
    }
    
    try {
      console.log('authAPI.refresh: 發送 refresh 請求');
      // 使用不經過攔截器的 refreshApi 避免循環調用
      const response = await refreshApi.post('/auth/refresh', { refreshToken });
      console.log('authAPI.refresh: 收到響應:', response.data);
      
      const { access_token, refresh_token, user } = response.data;
      
      if (!access_token || !refresh_token) {
        console.error('authAPI.refresh: 響應缺少必要的 tokens:', { access_token, refresh_token });
        throw new Error('Refresh 響應缺少必要的 tokens');
      }
      
      // 更新 localStorage 中的 token
      setTokens(access_token, refresh_token);
      
      console.log('authAPI.refresh: 成功更新 tokens');
      // 返回底線格式的欄位名稱，與 localStorage key 一致
      return { access_token, refresh_token, user };
    } catch (error) {
      console.error('authAPI.refresh: 刷新失敗:', error);
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
        console.error('登出 API 錯誤:', error);
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