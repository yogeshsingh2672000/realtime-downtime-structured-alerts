"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/utils";

export type AlertItem = {
  id: string;
  email: string;
  llmProvider: string;
  model: string;
  createdAt: number;
};

type ListResponse = { items: AlertItem[] };
type CreateResponse = { item: AlertItem };

export function useAlerts() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<ListResponse>(ROUTES.api.alerts, { method: "GET" });
      setItems(res.items);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (input: { email: string; llmProvider: string; model: string }) => {
    const res = await apiFetch<CreateResponse>(ROUTES.api.alerts, {
      method: "POST",
      body: JSON.stringify(input),
    });
    setItems((prev) => [res.item, ...prev]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await apiFetch(`${ROUTES.api.alerts}/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const empty = useMemo(() => !loading && items.length === 0 && !error, [items.length, loading, error]);

  return { items, loading, error, empty, fetchAll, create, remove };
}


