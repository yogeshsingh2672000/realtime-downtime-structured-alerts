"use client";
import { useEffect, useState, useCallback } from "react";
import { ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/utils";

type SessionState = {
  authenticated: boolean;
  user: null | { id: string; name: string; email: string; provider: string };
};

export function useSession() {
  const [data, setData] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<SessionState>(ROUTES.api.session, { method: "GET" });
      setData(res);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch session");
      setData({ authenticated: false, user: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async () => {
    await apiFetch(ROUTES.api.login, { method: "POST" });
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiFetch(ROUTES.api.logout, { method: "POST" });
    await refresh();
  }, [refresh]);

  return { data, loading, error, login, logout, refresh };
}


