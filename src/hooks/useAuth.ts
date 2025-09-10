import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  provider?: string;
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
  success?: boolean;
  user?: User;
  authenticated?: boolean;
  error?: string;
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

  const checkSession = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const data: AuthResponse = await ApiService.getSession();

      if (data.authenticated && data.user) {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
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

      if (data.user) {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user: data.user };
      } else {
        const errorMessage = data.error || 'Login failed';
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
      
      await ApiService.logout();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
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
