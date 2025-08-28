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

  const normalize = (payload: any): UserModelMap[] => {
    if (Array.isArray(payload)) return payload as UserModelMap[];
    if (payload && Array.isArray(payload.items)) return payload.items as UserModelMap[];
    return [];
  };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<any>(ROUTES.api.userModelMapper, { method: "GET" });
      setItems(normalize(res));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load mappings");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (body: { user_id: number; model_id: number[] }) => {
    const res = await apiFetch<{ item?: UserModelMap } | any>(ROUTES.api.userModelMapper, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const item = (res && res.item) as UserModelMap | undefined;
    if (item) setItems((prev) => [item, ...prev]);
    else await fetchAll();
  }, [fetchAll]);

  const update = useCallback(async (id: string, body: Partial<Pick<UserModelMap, "user_id" | "model_id">>) => {
    const res = await apiFetch<{ item?: UserModelMap } | any>(`${ROUTES.api.userModelMapper}/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    const item = (res && res.item) as UserModelMap | undefined;
    if (item) setItems((prev) => prev.map((m) => (m.id === id ? item : m)));
    else await fetchAll();
  }, [fetchAll]);

  const remove = useCallback(async (id: string) => {
    await apiFetch(`${ROUTES.api.userModelMapper}/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return typeof userId === "number" ? list.filter((i) => i.user_id === userId) : list;
  }, [items, userId]);

  const empty = useMemo(() => !loading && filtered.length === 0 && !error, [filtered.length, loading, error]);

  return { items: filtered, loading, error, empty, fetchAll, create, update, remove };
}


