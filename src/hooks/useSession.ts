"use client";
import { useState, useCallback } from "react";

// Hardcoded user for simplicity
const HARDCODED_USER = {
  id: "user_mock_google_1",
  name: "Mock Google User",
  email: "mock.user@gmail.com",
  provider: "google",
};

type SessionState = {
  authenticated: boolean;
  user: null | { id: string; name: string; email: string; provider: string };
};

export function useSession() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  const login = useCallback(async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setAuthenticated(false);
  }, []);

  const data: SessionState = {
    authenticated,
    user: authenticated ? HARDCODED_USER : null,
  };

  return { 
    data, 
    loading: false, 
    error: null, 
    login, 
    logout, 
    refresh: () => {} // No-op for compatibility
  };
}


