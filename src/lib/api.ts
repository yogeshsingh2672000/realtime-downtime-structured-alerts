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
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const responseData = await response.json();
    const { accessToken, refreshToken } = responseData;
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
    }
    return responseData;
  }

  static async logout() {
    const { refreshToken } = getTokens();
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    clearTokens();
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return await response.json();
  }

  static async getSession() {
    // Use the Next.js API route instead of calling backend directly
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Session check failed');
    }
    
    return await response.json();
  }

  // User endpoints
  static async getUserProfile() {
    const response = await fetch('/api/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    
    return await response.json();
  }

  static async updateUserProfile(data: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    date_of_birth?: string | null;
    admin?: boolean | null;
  }) {
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
    
    return await response.json();
  }

  // Models endpoints
  static async getModels() {
    const response = await fetch('/api/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get models');
    }
    
    return await response.json();
  }

  static async createModel(data: {
    modelName: string;
    provider: string;
    description?: string;
    version?: string;
    updatedBy: string;
  }) {
    const response = await fetch('/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create model');
    }
    
    return await response.json();
  }

  static async updateModel(id: string, data: {
    modelName?: string;
    provider?: string;
    description?: string;
    version?: string;
    updatedBy: string;
  }) {
    const response = await fetch(`/api/models/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update model');
    }
    
    return await response.json();
  }

  static async deleteModel(id: string) {
    const response = await fetch(`/api/models/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete model');
    }
    
    // For DELETE operations, return success status
    return { success: true };
  }

  // User Model Mapper endpoints
  static async getUserModelMappers(userId: number) {
    const response = await fetch(`/api/user-model-mapper?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user model mappers');
    }
    
    return await response.json();
  }

  static async createUserModelMapper(data: {
    user_id: number;
    model_id: number[];
  }) {
    const response = await fetch('/api/user-model-mapper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create user model mapper');
    }
    
    return await response.json();
  }

  static async updateUserModelMapper(id: string, data: {
    user_id?: number;
    model_id?: number[] | null;
  }) {
    const response = await fetch(`/api/user-model-mapper/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user model mapper');
    }
    
    return await response.json();
  }

  static async deleteUserModelMapper(id: string) {
    const response = await fetch(`/api/user-model-mapper/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user model mapper');
    }
    
    return await response.json();
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
    const response = await fetch('/api/email/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to trigger email');
    }
    
    return await response.json();
  }
}

export default apiClient;
