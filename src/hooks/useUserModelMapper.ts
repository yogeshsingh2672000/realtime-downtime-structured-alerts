"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/utils";

export type UserModelMap = {
  id: string;
  user_id: number;
  model_id: number[] | null;
  created_at?: number | null;
  updated_at?: number | null;
};

export function useUserModelMapper(userId?: number) {
  const [items, setItems] = useState<UserModelMap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<UserModelMap[]>(ROUTES.api.userModelMapper, { method: "GET" });
      setItems(res);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load mappings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (body: { user_id: number; model_id: number[] }) => {
    const res = await apiFetch<{ item: UserModelMap }>(ROUTES.api.userModelMapper, {
      method: "POST",
      body: JSON.stringify(body),
    });
    setItems((prev) => [res.item, ...prev]);
  }, []);

  const update = useCallback(async (id: string, body: Partial<Pick<UserModelMap, "user_id" | "model_id">>) => {
    const res = await apiFetch<{ item: UserModelMap }>(`${ROUTES.api.userModelMapper}/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setItems((prev) => prev.map((m) => (m.id === id ? res.item : m)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await apiFetch(`${ROUTES.api.userModelMapper}/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const filtered = useMemo(() => (typeof userId === "number" ? items.filter((i) => i.user_id === userId) : items), [items, userId]);
  const empty = useMemo(() => !loading && filtered.length === 0 && !error, [filtered.length, loading, error]);

  return { items: filtered, loading, error, empty, fetchAll, create, update, remove };
}


