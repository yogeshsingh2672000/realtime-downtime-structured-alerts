"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthContext } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, error, saving, save } = useUserProfile();
  const { isAuthenticated } = useAuthContext();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    admin: false,
  });
  const [dobError, setDobError] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const dobInputRef = useRef<HTMLInputElement | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.pages.home);
    }
  }, [isAuthenticated, router]);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        email: profile.email ?? "",
        phone_number: profile.phone_number ?? "",
        date_of_birth: profile.date_of_birth ?? "",
        admin: profile.admin ?? false,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent future DOB
    if (formData.date_of_birth && formData.date_of_birth > today) {
      setDobError("Date of birth cannot be in the future.");
      return;
    }
    try {
      console.log('Saving profile with data:', formData); // Debug log
      await save({
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone_number: formData.phone_number || null,
        date_of_birth: formData.date_of_birth || null,
        admin: formData.admin,
      });
      console.log('Profile saved successfully'); // Debug log
    } catch (err) {
      console.error('Error saving profile:', err); // Debug log
      // Error is handled by the hook
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto flex items-center justify-center">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-white/70">Loading profile…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <Navbar title="Your Profile" showModels={false} />

      <Card>
        <CardHeader>
          <h2 className="font-medium">Personal Information</h2>
          <p className="text-sm text-white/70">Update your profile details</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/70">First name</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="text-xs text-white/70">Last name</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/70">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="text-xs text-white/70">Phone number</label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
                placeholder="Enter phone number"
              />
            </div>

            <div
              onClick={() => {
                const el = dobInputRef.current as any;
                if (el?.showPicker) el.showPicker();
                else el?.focus();
              }}
              className="cursor-pointer"
            >
              <label className="text-xs text-white/70">Date of birth</label>
              <Input
                ref={dobInputRef}
                type="date"
                value={formData.date_of_birth}
                max={today}
                onChange={(e) => {
                  const next = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    date_of_birth: next,
                  }));
                  setDobError(
                    next && next > today
                      ? "Date of birth cannot be in the future."
                      : null
                  );
                }}
              />
              {dobError && (
                <p className="mt-1 text-xs text-red-400">{dobError}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                checked={formData.admin}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, admin: e.target.checked }))
                }
              />
              <span className="text-sm">Admin privileges</span>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <h2 className="font-medium">Profile Summary</h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Created:</span>
              <span>{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
            {profile.updated_at && (
              <div className="flex justify-between">
                <span className="text-white/60">Last updated:</span>
                <span>{new Date(profile.updated_at).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/60">Admin:</span>
              <span>{profile.admin ? "Yes" : "No"}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
