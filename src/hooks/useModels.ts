"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/lib/constants";

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
      const res = await fetch(ROUTES.api.models);
      if (!res.ok) {
        throw new Error(`Failed to load models: ${res.status}`);
      }
      const data: ListResponse = await res.json();
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
    const res = await fetch(ROUTES.api.models, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to create model: ${res.status}`);
    }
    
    const data: CreateResponse = await res.json();
    if (data.item) {
      setItems((prev) => [data.item, ...prev]);
    } else {
      // Refresh the list if response format is different
      await fetchAll();
    }
  }, [fetchAll]);

  const update = useCallback(async (id: string, body: CreateBody) => {
    const res = await fetch(`${ROUTES.api.models}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to update model: ${res.status}`);
    }
    
    const data: UpdateResponse = await res.json();
    if (data.item) {
      setItems((prev) => prev.map((m) => (m.id === id ? data.item : m)));
    } else {
      // Refresh the list if response format is different
      await fetchAll();
    }
  }, [fetchAll]);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`${ROUTES.api.models}/${id}`, { 
      method: "DELETE" 
    });
    
    if (!res.ok) {
      throw new Error(`Failed to delete model: ${res.status}`);
    }
    
    setItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const empty = useMemo(() => !loading && items.length === 0 && !error, [items.length, loading, error]);

  return { items, loading, error, empty, fetchAll, create, update, remove };
}
