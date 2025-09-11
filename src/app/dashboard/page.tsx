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
import { useAlert } from "@/contexts/AlertContext";
import { useEmail } from "@/hooks/useEmail";
import { Navbar } from "@/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { profile } = useUserProfile();
  const { showSuccess, showError, showInfo } = useAlert();
  const { triggerEmail: sendEmail, loading: emailLoading } = useEmail();
  const {
    items: modelItems,
    loading: modelsLoading,
    error: modelsError,
  } = useModels();
  const userId = profile?.id ? Number(profile.id) : undefined;
  const { items, loading, error, empty, create, update, remove } =
    useUserModelMapper(userId);

  // Debug logging
  console.log('Dashboard - userId:', userId);
  console.log('Dashboard - profile:', profile);
  console.log('Dashboard - userModelMapper items:', items);
  console.log('Dashboard - userModelMapper loading:', loading);
  console.log('Dashboard - userModelMapper error:', error);

  const handleRemove = async (id: string) => {
    try {
      await remove(id);
      showSuccess("Destination removed successfully!", "Success");
    } catch (err: any) {
      showError("Failed to remove destination", "Error");
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.pages.home);
    }
  }, [isAuthenticated, router]);

  const providers = useMemo(() => {
    const uniq = new Set<string>();
    for (const m of modelItems) {
      if (m.provider) uniq.add(m.provider);
    }
    const result = Array.from(uniq);
    return result;
  }, [modelItems]);
  const [provider, setProvider] = useState("");
  const models = useMemo(() => {
    const result = modelItems
      .filter((m) => m.provider === provider)
      .map((m) => ({ id: String(m.id), name: m.modelName ?? "—" }));
    return result;
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
        showSuccess("Destination added successfully!", "Success");
      } else {
        const setIds = new Set<number>(current.model_id ?? []);
        setIds.add(Number(dbModel.id));
        await update(current.id, { model_id: Array.from(setIds) });
        showSuccess("Destination updated successfully!", "Success");
      }
    } catch (err: any) {
      const errorMessage = err?.message ?? "Failed to save mapping";
      setSubmitError(errorMessage);
      showError(errorMessage, "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const triggerEmail = async (email: string, type: 'downtime' | 'uptime') => {
    if (!email) {
      showError("Please configure your email address in your profile first", "Email Required");
      return;
    }

    // Get the selected model name for the email
    const selectedModel = modelItems.find(m => 
      String(m.id) === model && m.provider === provider
    );

    if (!selectedModel) {
      showError("Please select a valid model first", "Model Required");
      return;
    }

    try {
      const payload = {
        emailType: (type === 'downtime' ? 'downtime' : 'uptime') as 'downtime' | 'uptime',
        emailAddress: email,
        modelName: selectedModel.modelName || 'gpt-4o-mini',
        duration: type === 'downtime' ? '2 hours' : '15 minutes',
        serviceName: 'Example Service',
        additionalInfo: type === 'downtime' 
          ? 'Service is currently experiencing downtime and is unavailable.'
          : 'Service has been restored and is now operational.'
      };

      const result = await sendEmail(payload);
      console.log('Email result:', result); // Debug log

      if (result.ok || result.success) {
        if (type === 'downtime') {
          showInfo(
            `Service down alert email has been sent to ${email}. Check your inbox to see the notification format.`,
            "Service Down Alert Sent",
            8000
          );
        } else {
          showSuccess(
            `Service up alert email has been sent to ${email}. Check your inbox to see the notification format.`,
            "Service Up Alert Sent",
            8000
          );
        }
      } else {
        showError(
          result.error || "Failed to send email",
          "Email Error"
        );
      }
    } catch (error) {
      showError(
        "Failed to send email. Please try again.",
        "Email Error"
      );
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <Navbar title="Dashboard" showDashboard={false} />

      <Card>
        <CardHeader>
          <h2 className="font-medium text-gray-900 dark:text-white">Add destination</h2>
          <p className="text-sm text-gray-700 dark:text-white/70">
            LLM provider and model
          </p>
        </CardHeader>
        <CardContent>
          {modelsError && <p className="text-sm text-red-400">{modelsError}</p>}
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end"
          >
            <div>
              <label className="text-xs text-gray-700 dark:text-white/70">Provider</label>
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
              <label className="text-xs text-gray-700 dark:text-white/70">Model</label>
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
            <div className="md:col-span-2 flex items-center gap-3">
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

      {/* Destinations Card */}
      <Card>
        <CardHeader>
          <h2 className="font-medium">Alert Destinations</h2>
          <p className="text-sm text-white/70">
            Configure where you want to receive alerts
          </p>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-sm text-white/70">Loading destinations…</p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {empty && (
            <div className="text-center py-8">
              <p className="text-sm text-white/70 mb-2">
                No destinations configured yet
              </p>
              <p className="text-xs text-white/50">
                Add your first destination using the form above
              </p>
            </div>
          )}
          {!loading && !error && items.length > 0 && (
            <div className="space-y-3">
              {items.map((entry) => {
                const userModels = entry.model_id?.map(id => {
                  const model = modelItems.find(m => Number(m.id) === id);
                  return model ? `${model.provider} - ${model.modelName}` : `Model ${id}`;
                }) || [];
                
                return (
                  <div
                    key={entry.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm font-medium">Active Destination</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-white/70">Email</p>
                          <p className="text-sm">{profile?.email || 'Not configured'}</p>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-white/70 mb-1">AI Models</p>
                          <div className="flex flex-wrap gap-1">
                            {userModels.map((modelName, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300"
                              >
                                {modelName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleRemove(entry.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Remove
                      </Button>
                    </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="ghost"
                          onClick={() => triggerEmail(profile?.email || '', 'downtime')}
                          disabled={emailLoading}
                          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {emailLoading ? "Sending..." : "Send Down Alert"}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => triggerEmail(profile?.email || '', 'uptime')}
                          disabled={emailLoading}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10 text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {emailLoading ? "Sending..." : "Send Up Alert"}
                        </Button>
                      </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-white/50">
            Destinations are automatically saved and can be managed here
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
