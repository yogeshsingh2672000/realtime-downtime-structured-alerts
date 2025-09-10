"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiService } from "@/lib/api";

export type ModelItem = {
  id: string;
  createdAt: number;
  modelName: string | null;
  provider: string | null;
  updatedAt: number | null;
  description: string | null;
  version: string | null;
  updatedBy: string | null;
};

type ListResponse = ModelItem[]; // Direct array, not wrapped in object
type CreateBody = Partial<Pick<ModelItem, "modelName" | "provider" | "description" | "version" | "updatedBy">>;
type CreateResponse = { item: ModelItem };
type UpdateResponse = { item: ModelItem };

export function useModels() {
  const [items, setItems] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const data: ListResponse = await ApiService.getModels();
      console.log("📡 Raw API response:", data);
      console.log("📊 Number of items received:", data?.length || 0);
      console.log("📋 Items array:", data);
      setItems(data || []);
      setError(null);
    } catch (e: any) {
      console.error("❌ Error fetching models:", e);
      setError(e?.message ?? "Failed to load models");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (body: CreateBody) => {
    const data: CreateResponse = await ApiService.createModel(body as any);
    if (data.item) {
      setItems((prev) => [data.item, ...prev]);
    } else {
      // Refresh the list if response format is different
      await fetchAll();
    }
  }, [fetchAll]);

  const update = useCallback(async (id: string, body: CreateBody) => {
    const data: UpdateResponse = await ApiService.updateModel(id, body as any);
    if (data.item) {
      setItems((prev) => prev.map((m) => (m.id === id ? data.item : m)));
    } else {
      // Refresh the list if response format is different
      await fetchAll();
    }
  }, [fetchAll]);

  const remove = useCallback(async (id: string) => {
    await ApiService.deleteModel(id);
    setItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const empty = useMemo(() => !loading && items.length === 0 && !error, [items.length, loading, error]);

  return { items, loading, error, empty, fetchAll, create, update, remove };
}
