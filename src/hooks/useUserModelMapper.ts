"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/utils";

export type UserModelMap = {
  id: string;
  created_at: number;
  updated_at: number | null;
  user_id: number | null;
  model_id: number[] | null;
};

type ListResponse = { items: UserModelMap[] };
type CreateResponse = { item: UserModelMap };
type UpdateResponse = { item: UserModelMap };

export function useUserModelMapper(userId?: number) {
  const [items, setItems] = useState<UserModelMap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const qs = userId != null ? `?userId=${userId}` : "";
      const res = await apiFetch<ListResponse>(`${ROUTES.api.userModelMapper}${qs}`);
      setItems(res.items);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load mappings");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (body: { user_id: number; model_id: number[] }) => {
    const res = await apiFetch<CreateResponse>(ROUTES.api.userModelMapper, {
      method: "POST",
      body: JSON.stringify(body),
    });
    setItems((prev) => [res.item, ...prev]);
  }, []);

  const update = useCallback(async (id: string, body: Partial<{ user_id: number; model_id: number[] }>) => {
    const res = await apiFetch<UpdateResponse>(`${ROUTES.api.userModelMapper}/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setItems((prev) => prev.map((m) => (m.id === id ? res.item : m)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await apiFetch(`${ROUTES.api.userModelMapper}/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const empty = useMemo(() => !loading && items.length === 0 && !error, [items.length, loading, error]);

  return { items, loading, error, empty, fetchAll, create, update, remove };
}


