"use client";
import { useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/utils";

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: number | null;
  date_of_birth: string | null; // YYYY-MM-DD
  admin: boolean | null;
  created_at: number;
  updated_at: number | null;
};

type GetResponse = { profile: UserProfile };
type PutBody = Partial<Pick<UserProfile, "first_name" | "last_name" | "email" | "phone_number" | "date_of_birth" | "admin">>;
type PutResponse = { profile: UserProfile };

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<GetResponse>(ROUTES.api.user);
      setProfile(res.profile);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (body: PutBody) => {
    try {
      setSaving(true);
      const res = await apiFetch<PutResponse>(ROUTES.api.user, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setProfile(res.profile);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save profile");
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return { profile, loading, error, saving, refresh, save };
}
