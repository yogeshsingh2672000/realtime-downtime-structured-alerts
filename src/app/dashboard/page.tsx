"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useModels } from "@/hooks/useModels";
import { useUserModelMapper } from "@/hooks/useUserModelMapper";
import { useAuthContext } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { profile } = useUserProfile();
  const {
    items: modelItems,
    loading: modelsLoading,
    error: modelsError,
  } = useModels();
  const userId = profile?.id ? Number(profile.id) : undefined;
  const { items, loading, error, empty, create, update, remove } =
    useUserModelMapper(userId);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.pages.home);
    }
  }, [isAuthenticated, router]);

  const [email, setEmail] = useState("");
  const providers = useMemo(() => {
    const uniq = new Set<string>();
    for (const m of modelItems) {
      if (m.provider) uniq.add(m.provider);
    }
    return Array.from(uniq);
  }, [modelItems]);
  const [provider, setProvider] = useState("");
  const models = useMemo(() => {
    return modelItems
      .filter((m) => m.provider === provider)
      .map((m) => ({ id: String(m.id), name: m.modelName ?? "—" }));
  }, [modelItems, provider]);
  const [model, setModel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize provider from DB once models load
  useEffect(() => {
    if (!provider && providers.length > 0) {
      setProvider(providers[0]);
    }
  }, [providers, provider]);

  // Initialize or correct model when provider or model list changes
  useEffect(() => {
    const first = models[0]?.id ?? "";
    if (!model || !models.find((m) => m.id === model)) {
      setModel(first);
    }
  }, [models, model]);



  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!provider || !model) {
      setSubmitError("Please select provider and model");
      return;
    }
    if (!userId) {
      setSubmitError("User not loaded yet");
      return;
    }
    try {
      setSubmitting(true);
      const dbModel = modelItems.find(
        (m) => String(m.id) === model && m.provider === provider
      );
      if (!dbModel) {
        throw new Error(
          "Selected model not found in database. Add it on Models page first."
        );
      }
      const current = items.find((m) => m.user_id === userId);
      if (!current) {
        await create({ user_id: userId, model_id: [Number(dbModel.id)] });
      } else {
        const setIds = new Set<number>(current.model_id ?? []);
        setIds.add(Number(dbModel.id));
        await update(current.id, { model_id: Array.from(setIds) });
      }
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to save mapping");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <Navbar title="Dashboard" showDashboard={false} />

      <Card>
        <CardHeader>
          <h2 className="font-medium">Add destination</h2>
          <p className="text-sm text-white/70">
            Email + LLM provider and model
          </p>
        </CardHeader>
        <CardContent>
          {modelsError && <p className="text-sm text-red-400">{modelsError}</p>}
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          >
            <div className="md:col-span-2">
              <label className="text-xs text-white/70">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-white/70">Provider</label>
              <Select
                value={provider}
                onChange={(e) => {
                  const next = e.target.value;
                  setProvider(next);
                  const firstModel = models[0]?.id ?? "";
                  setModel(firstModel);
                }}
                disabled={modelsLoading || providers.length === 0}
              >
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs text-white/70">Model</label>
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={modelsLoading || models.length === 0}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-4 flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding…" : "Add"}
              </Button>
              {submitError && (
                <p className="text-sm text-red-400">{submitError}</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Destinations</h2>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-sm text-white/70">Loading mappings…</p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {empty && (
            <p className="text-sm text-white/70">
              No mappings yet. Add one above.
            </p>
          )}
          {!loading && !error && items.length > 0 && (
            <ul className="divide-y divide-white/10">
              {items.map((entry) => (
                <li
                  key={entry.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">User #{entry.user_id}</p>
                    <p className="text-xs text-white/60">
                      Models: {(entry.model_id ?? []).join(", ")}
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => remove(entry.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-white/50">
            Mappings are stored in the database.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
