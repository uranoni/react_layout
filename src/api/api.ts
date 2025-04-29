import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// 創建 axios 實例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const { accessToken, refreshToken, user } = response.data;
    
    // 將 token 存儲到 localStorage
    setTokens(accessToken, refreshToken);
    
    return { user };
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

export default api; 