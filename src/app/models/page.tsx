"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useModels } from "@/hooks/useModels";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function ModelsPage() {
  const router = useRouter();
  const { items, loading, error, empty, create, update, remove } = useModels();
  const { logout } = useSession();

  const [form, setForm] = useState({
    modelName: "",
    provider: "",
    description: "",
    version: "",
    updatedBy: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.modelName || !form.provider) {
      setSubmitError("Model name and provider are required");
      return;
    }
    try {
      setSubmitting(true);
      await create(form);
      setForm({
        modelName: "",
        provider: "",
        description: "",
        version: "",
        updatedBy: "",
      });
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to add model");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Models</h1>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push(ROUTES.pages.dashboard)}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push(ROUTES.pages.profile)}
          >
            Profile
          </Button>
          <Button variant="ghost" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium">Add / Update Model</h2>
          <p className="text-sm text-white/70">
            Manage your LLM models metadata
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
          >
            <div>
              <label className="text-xs text-white/70">Model name</label>
              <Input
                value={form.modelName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, modelName: e.target.value }))
                }
                placeholder="e.g., GPT-4o mini"
              />
            </div>
            <div>
              <label className="text-xs text-white/70">Provider</label>
              <Input
                value={form.provider}
                onChange={(e) =>
                  setForm((p) => ({ ...p, provider: e.target.value }))
                }
                placeholder="e.g., OpenAI"
              />
            </div>
            <div>
              <label className="text-xs text-white/70">Version</label>
              <Input
                value={form.version}
                onChange={(e) =>
                  setForm((p) => ({ ...p, version: e.target.value }))
                }
                placeholder="e.g., 1.0.0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/70">Description</label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Short description"
              />
            </div>
            <div>
              <label className="text-xs text-white/70">Updated by</label>
              <Input
                value={form.updatedBy}
                onChange={(e) =>
                  setForm((p) => ({ ...p, updatedBy: e.target.value }))
                }
                placeholder="Your name"
              />
            </div>
            <div className="md:col-span-3 flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Save"}
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
          <h2 className="font-medium">All Models</h2>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-white/70">Loading models…</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {empty && (
            <p className="text-sm text-white/70">
              No models yet. Add one above.
            </p>
          )}
          {!loading && !error && items.length > 0 && (
            <ul className="divide-y divide-white/10">
              {items.map((m) => (
                <li
                  key={m.id}
                  className="py-3 grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
                >
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium">{m.modelName ?? "—"}</p>
                    <p className="text-xs text-white/60">{m.provider ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Version</p>
                    <p className="text-sm">{m.version ?? "—"}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs text-white/60">Updated by</p>
                    <p className="text-sm">{m.updatedBy ?? "—"}</p>
                  </div>
                  <div className="flex gap-2 md:justify-end">
                    <Button variant="ghost" onClick={() => remove(m.id)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-white/50">
            Models are stored per session (mock). Data resets on restart.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
