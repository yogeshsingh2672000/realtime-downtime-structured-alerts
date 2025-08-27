"use client";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LLM_PROVIDERS, PROVIDER_TO_MODELS } from "@/lib/constants";
import { useAlerts } from "@/hooks/useAlerts";
import { useSession } from "@/hooks/useSession";

export default function DashboardPage() {
  const { items, loading, error, empty, create, remove } = useAlerts();
  const { logout } = useSession();

  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState(LLM_PROVIDERS[0].id);
  const models = useMemo(() => PROVIDER_TO_MODELS[provider] ?? [], [provider]);
  const [model, setModel] = useState(models[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!email || !provider || !model) {
      setSubmitError("Please fill all fields");
      return;
    }
    try {
      setSubmitting(true);
      await create({ email, llmProvider: provider, model });
      setEmail("");
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to add alert");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Alert Destinations</h1>
        <Button variant="ghost" onClick={() => logout()}>
          Log out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Add destination</h2>
          <p className="text-sm text-white/70">
            Email + LLM provider and model
          </p>
        </CardHeader>
        <CardContent>
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
                  const firstModel =
                    (PROVIDER_TO_MODELS[next] ?? [])[0]?.id ?? "";
                  setModel(firstModel);
                }}
              >
                {LLM_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs text-white/70">Model</label>
              <Select value={model} onChange={(e) => setModel(e.target.value)}>
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
            <p className="text-sm text-white/70">Loading destinations…</p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {empty && (
            <p className="text-sm text-white/70">
              No destinations yet. Add one above.
            </p>
          )}
          {!loading && !error && items.length > 0 && (
            <ul className="divide-y divide-white/10">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{item.email}</p>
                    <p className="text-xs text-white/60">
                      {item.llmProvider} • {item.model}
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => remove(item.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-white/50">
            Destinations are stored per session (mock). Data resets on restart.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
