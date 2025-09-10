/**
 * Token Storage Utility
 * Handles secure storage and retrieval of access and refresh tokens
 */

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

export interface UserData {
  id: string;
  email: string;
  username?: string;
  admin?: boolean;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRES_KEY = 'token_expires';
const USER_DATA_KEY = 'user_data';

class TokenStorage {
  /**
   * Store tokens and user data
   */
  setTokens(tokenData: TokenData, userData: UserData): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenData.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken);
      localStorage.setItem(TOKEN_EXPIRES_KEY, tokenData.expiresAt.toString());
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get token expiration timestamp
   */
  getTokenExpiration(): number | null {
    try {
      const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY);
      return expiresAt ? parseInt(expiresAt, 10) : null;
    } catch (error) {
      console.error('Failed to get token expiration:', error);
      return null;
    }
  }

  /**
   * Get user data
   */
  getUserData(): UserData | null {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  isAccessTokenExpired(): boolean {
    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) return true;
    
    // Add 30 second buffer to account for clock skew
    const bufferTime = 30 * 1000; // 30 seconds in milliseconds
    return Date.now() >= (expiresAt - bufferTime);
  }

  /**
   * Check if refresh token is expired (7 days)
   */
  isRefreshTokenExpired(): boolean {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return true;

    try {
      // Decode JWT to get expiration (without verification since we're just checking expiration)
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch (error) {
      console.error('Failed to decode refresh token:', error);
      return true;
    }
  }

  /**
   * Update access token (keep refresh token and user data)
   */
  updateAccessToken(accessToken: string, expiresIn: number): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      const expiresAt = Date.now() + (expiresIn * 1000);
      localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString());
    } catch (error) {
      console.error('Failed to update access token:', error);
    }
  }

  /**
   * Clear all tokens and user data
   */
  clearTokens(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRES_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Check if user is authenticated (has valid tokens)
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const userData = this.getUserData();

    if (!accessToken || !refreshToken || !userData) {
      return false;
    }

    // If access token is expired but refresh token is still valid, user is still authenticated
    // (refresh will be handled by the interceptor)
    return !this.isRefreshTokenExpired();
  }

  /**
   * Get all stored data
   */
  getAllData(): { tokens: TokenData | null; user: UserData | null } {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiresAt = this.getTokenExpiration();
    const userData = this.getUserData();

    if (!accessToken || !refreshToken || !expiresAt) {
      return { tokens: null, user: userData };
    }

    return {
      tokens: {
        accessToken,
        refreshToken,
        expiresAt,
      },
      user: userData,
    };
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage();
export default tokenStorage;
