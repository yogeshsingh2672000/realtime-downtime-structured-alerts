"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/utils";

export type ModelItem = {
  id: string;
  created_at: number;
  model_name: string | null;
  model_provider: string | null;
  updated_at: number | null;
  description: string | null;
  version: string | null;
  updated_by: string | null;
};

type ListResponse = { items: ModelItem[] };

type CreateBody = Partial<Pick<ModelItem, "model_name" | "model_provider" | "description" | "version" | "updated_by">>;

type CreateResponse = { item: ModelItem };

type UpdateResponse = { item: ModelItem };

export function useModels() {
  const [items, setItems] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<ListResponse>(`${ROUTES.api.models}`);
      setItems(res.items);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load models");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (body: CreateBody) => {
    const res = await apiFetch<CreateResponse>(ROUTES.api.models, {
      method: "POST",
      body: JSON.stringify(body),
    });
    setItems((prev) => [res.item, ...prev]);
  }, []);

  const update = useCallback(async (id: string, body: CreateBody) => {
    const res = await apiFetch<UpdateResponse>(`${ROUTES.api.models}/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setItems((prev) => prev.map((m) => (m.id === id ? res.item : m)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await apiFetch(`${ROUTES.api.models}/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const empty = useMemo(() => !loading && items.length === 0 && !error, [items.length, loading, error]);

  return { items, loading, error, empty, fetchAll, create, update, remove };
}
