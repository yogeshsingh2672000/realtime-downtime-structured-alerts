/**
 * Token Refresh Service
 * Handles automatic token refresh and retry logic
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { tokenStorage } from './tokenStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface RefreshResponse {
  ok: boolean;
  accessToken: string;
  expiresIn: number;
  message: string;
}

class TokenRefreshService {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the current refresh to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      if (tokenStorage.isRefreshTokenExpired()) {
        throw new Error('Refresh token expired');
      }

      const response = await axios.post<RefreshResponse>(
        `${API_BASE_URL}/api/auth/refresh`,
        { refresh_token: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data.ok && response.data.accessToken) {
        // Update stored access token
        tokenStorage.updateAccessToken(
          response.data.accessToken,
          response.data.expiresIn
        );

        // Process queued requests
        this.processQueue(null, response.data.accessToken);
        
        return response.data.accessToken;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear tokens and redirect to login
      tokenStorage.clearTokens();
      
      // Process queued requests with error
      this.processQueue(error, null);
      
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Retry a failed request with new token
   */
  async retryRequest(originalRequest: AxiosRequestConfig): Promise<AxiosResponse> {
    const newToken = await this.refreshAccessToken();
    
    if (!newToken) {
      throw new Error('Failed to refresh token');
    }

    // Update the original request with new token
    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
    } else {
      originalRequest.headers = {
        Authorization: `Bearer ${newToken}`,
      };
    }

    // Retry the request
    return axios(originalRequest);
  }

  /**
   * Check if error is due to expired token
   */
  isTokenExpiredError(error: any): boolean {
    return (
      error?.response?.status === 401 &&
      error?.response?.data?.error === 'invalid_token'
    );
  }

  /**
   * Check if error is due to invalid session
   */
  isSessionExpiredError(error: any): boolean {
    return (
      error?.response?.status === 401 &&
      (error?.response?.data?.error === 'invalid_session' ||
       error?.response?.data?.error === 'expired_session')
    );
  }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();
export default tokenRefreshService;
