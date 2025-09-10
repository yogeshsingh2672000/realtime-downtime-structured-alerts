import { useState, useEffect, useCallback } from 'react';
import { tokenStorage, UserData } from '@/lib/tokenStorage';
import { ApiService } from '@/lib/api';
import { tokenExpirationHandler } from '@/lib/tokenExpirationHandler';

interface User {
  id: string;
  email: string;
  username?: string;
  admin?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  ok?: boolean;
  user?: User;
  authenticated?: boolean;
  accessToken?: string;
  expiresIn?: number;
  error?: string;
  message?: string;
  [key: string]: any; // Allow additional properties from API
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Start token expiration monitoring when authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      tokenExpirationHandler.startMonitoring();
    } else {
      tokenExpirationHandler.stopMonitoring();
    }

    // Listen for token expiration events
    const handleTokenExpired = () => {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please log in again.',
      });
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      tokenExpirationHandler.stopMonitoring();
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, [authState.isAuthenticated]);

  const checkSession = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // First check if we have valid tokens locally
      if (tokenStorage.isAuthenticated()) {
        const { user } = tokenStorage.getAllData();
        if (user) {
          setAuthState({
            user: user as User,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      }

      // If no valid local tokens, try to get session from server
      const data: AuthResponse = await ApiService.getSession();

      if (data.authenticated && data.user) {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Clear any invalid tokens
        tokenStorage.clearTokens();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
      // Clear tokens on error
      tokenStorage.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to check authentication status',
      });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const data: AuthResponse = await ApiService.login(credentials);

      if (data.ok && data.user && data.accessToken && data.expiresIn) {
        // Store tokens and user data
        const userData: UserData = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          admin: data.user.admin,
        };

        tokenStorage.setTokens(
          {
            accessToken: data.accessToken,
            refreshToken: '', // Will be set by cookie
            expiresAt: Date.now() + (data.expiresIn * 1000),
          },
          userData
        );

        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user: data.user };
      } else {
        const errorMessage = data.error || data.message || 'Login failed';
        setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Stop monitoring
      tokenExpirationHandler.stopMonitoring();
      
      // Clear tokens first
      tokenStorage.clearTokens();
      
      // Call logout API
      await ApiService.logout();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local state
      tokenExpirationHandler.stopMonitoring();
      tokenStorage.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return { success: true };
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    login,
    logout,
    checkSession,
    clearError,
  };
};
