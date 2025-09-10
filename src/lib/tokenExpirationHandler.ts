/**
 * Token Expiration Handler
 * Handles automatic token expiration checks and cleanup
 */

import { tokenStorage } from './tokenStorage';

class TokenExpirationHandler {
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute

  /**
   * Start monitoring token expiration
   */
  startMonitoring(): void {
    if (this.checkInterval) {
      return; // Already monitoring
    }

    this.checkInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, this.CHECK_INTERVAL);

    // Check immediately
    this.checkTokenExpiration();
  }

  /**
   * Stop monitoring token expiration
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check if tokens are expired and handle accordingly
   */
  private checkTokenExpiration(): void {
    if (!tokenStorage.isAuthenticated()) {
      return;
    }

    // Check if refresh token is expired
    if (tokenStorage.isRefreshTokenExpired()) {
      console.log('Refresh token expired, clearing tokens');
      tokenStorage.clearTokens();
      
      // Dispatch custom event for logout
      this.dispatchLogoutEvent();
    }
  }

  /**
   * Dispatch logout event that components can listen to
   */
  private dispatchLogoutEvent(): void {
    const event = new CustomEvent('tokenExpired', {
      detail: { reason: 'refresh_token_expired' }
    });
    window.dispatchEvent(event);
  }

  /**
   * Force logout (useful for manual logout)
   */
  forceLogout(): void {
    tokenStorage.clearTokens();
    this.dispatchLogoutEvent();
  }

  /**
   * Get time until access token expires (in milliseconds)
   */
  getTimeUntilAccessTokenExpires(): number | null {
    const expiresAt = tokenStorage.getTokenExpiration();
    if (!expiresAt) return null;
    
    const timeLeft = expiresAt - Date.now();
    return timeLeft > 0 ? timeLeft : 0;
  }

  /**
   * Get time until refresh token expires (in milliseconds)
   */
  getTimeUntilRefreshTokenExpires(): number | null {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const timeLeft = exp - Date.now();
      return timeLeft > 0 ? timeLeft : 0;
    } catch (error) {
      console.error('Failed to decode refresh token:', error);
      return null;
    }
  }

  /**
   * Check if access token will expire soon (within 5 minutes)
   */
  willAccessTokenExpireSoon(): boolean {
    const timeLeft = this.getTimeUntilAccessTokenExpires();
    if (timeLeft === null) return true;
    
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    return timeLeft <= fiveMinutes;
  }

  /**
   * Check if refresh token will expire soon (within 1 hour)
   */
  willRefreshTokenExpireSoon(): boolean {
    const timeLeft = this.getTimeUntilRefreshTokenExpires();
    if (timeLeft === null) return true;
    
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    return timeLeft <= oneHour;
  }
}

// Export singleton instance
export const tokenExpirationHandler = new TokenExpirationHandler();
export default tokenExpirationHandler;
