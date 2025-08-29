"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/lib/constants";

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
      const res = await fetch(ROUTES.api.userModelMapper, { method: "GET" });
      if (!res.ok) {
        throw new Error(`Failed to load mappings: ${res.status}`);
      }
      const data = await res.json();
      setItems(normalize(data));
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
    const res = await fetch(ROUTES.api.userModelMapper, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to create mapping: ${res.status}`);
    }
    
    const data = await res.json();
    const item = (data && data.item) as UserModelMap | undefined;
    if (item) {
      setItems((prev) => [item, ...prev]);
    } else {
      // Refresh the list if response format is different
      await fetchAll();
    }
  }, [fetchAll]);

  const update = useCallback(async (id: string, body: Partial<Pick<UserModelMap, "user_id" | "model_id">>) => {
    const res = await fetch(`${ROUTES.api.userModelMapper}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to update mapping: ${res.status}`);
    }
    
    const data = await res.json();
    const item = (data && data.item) as UserModelMap | undefined;
    if (item) {
      setItems((prev) => prev.map((m) => (m.id === id ? item : m)));
    } else {
      // Refresh the list if response format is different
      await fetchAll();
    }
  }, [fetchAll]);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`${ROUTES.api.userModelMapper}/${id}`, { method: "DELETE" });
    
    if (!res.ok) {
      throw new Error(`Failed to delete mapping: ${res.status}`);
    }
    
    setItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return typeof userId === "number" ? list.filter((i) => i.user_id === userId) : list;
  }, [items, userId]);

  const empty = useMemo(() => !loading && filtered.length === 0 && !error, [filtered.length, loading, error]);

  return { items: filtered, loading, error, empty, fetchAll, create, update, remove };
}


