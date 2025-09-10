import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // No cookies needed
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const getTokens = () => ({ accessToken, refreshToken });

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add access token to requests
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh on 401 errors
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(newAccessToken, newRefreshToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens
        clearTokens();
        return Promise.reject(refreshError);
      }
    }
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    } else if (error.response?.status === 403) {
      // Handle forbidden access
      console.error('Forbidden access');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

// API Service class
export class ApiService {
  // Auth endpoints
  static async register(data: {
    email: string;
    username?: string;
    password: string;
    phone_number: string;
  }) {
    const response = await apiClient.post('/api/auth/register', data);
    const { accessToken, refreshToken } = response.data;
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
    }
    return response.data;
  }

  static async login(data: { email: string; password: string }) {
    const response = await apiClient.post('/api/auth/login', data);
    const { accessToken, refreshToken } = response.data;
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
    }
    return response.data;
  }

  static async logout() {
    const { refreshToken } = getTokens();
    const response = await apiClient.post('/api/auth/logout', { refresh_token: refreshToken });
    clearTokens();
    return response.data;
  }

  static async getSession() {
    const response = await apiClient.get('/api/auth/session');
    return response.data;
  }

  // User endpoints
  static async getUserProfile() {
    const response = await apiClient.get('/api/user');
    return response.data;
  }

  static async updateUserProfile(data: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    date_of_birth?: string | null;
    admin?: boolean;
  }) {
    const response = await apiClient.put('/api/user', data);
    return response.data;
  }

  // Models endpoints
  static async getModels() {
    const response = await apiClient.get('/api/models');
    return response.data;
  }

  static async createModel(data: {
    modelName: string;
    provider: string;
    description?: string;
    version?: string;
    updatedBy: string;
  }) {
    const response = await apiClient.post('/api/models', data);
    return response.data;
  }

  static async updateModel(id: string, data: {
    modelName?: string;
    provider?: string;
    description?: string;
    version?: string;
    updatedBy: string;
  }) {
    const response = await apiClient.put(`/api/models/${id}`, data);
    return response.data;
  }

  static async deleteModel(id: string) {
    const response = await apiClient.delete(`/api/models/${id}`);
    return response.data;
  }

  // User Model Mapper endpoints
  static async getUserModelMappers(userId: number) {
    const response = await apiClient.get(`/api/user-model-mapper?user_id=${userId}`);
    return response.data;
  }

  static async createUserModelMapper(data: {
    user_id: number;
    model_id: number[];
  }) {
    const response = await apiClient.post('/api/user-model-mapper', data);
    return response.data;
  }

  static async updateUserModelMapper(id: string, data: {
    user_id?: number;
    model_id?: number[] | null;
  }) {
    const response = await apiClient.put(`/api/user-model-mapper/${id}`, data);
    return response.data;
  }

  static async deleteUserModelMapper(id: string) {
    const response = await apiClient.delete(`/api/user-model-mapper/${id}`);
    return response.data;
  }

  // Email endpoints
  static async triggerEmail(data: {
    emailType: 'downtime' | 'uptime';
    emailAddress: string;
    modelName: string;
    duration: string;
    serviceName: string;
    additionalInfo: string;
  }) {
    const response = await apiClient.post('/api/email/trigger', data);
    return response.data;
  }
}

export default apiClient;
