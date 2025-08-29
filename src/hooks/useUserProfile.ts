"use client";
import { useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/lib/constants";

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

type GetResponse = { profiles: UserProfile[] } | { profile: UserProfile };
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
      const res = await fetch(ROUTES.api.user);
      
      if (!res.ok) {
        throw new Error(`Failed to load profile: ${res.status}`);
      }
      
      const data: GetResponse = await res.json();
      
      // Handle different response formats
      if ('profile' in data) {
        setProfile(data.profile);
      } else if ('profiles' in data && data.profiles.length > 0) {
        setProfile(data.profiles[0]); // Take first profile if multiple
      } else {
        setProfile(null);
      }
      
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
      const res = await fetch(ROUTES.api.user, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to save profile: ${res.status}`);
      }
      
      const data: PutResponse = await res.json();
      
      if (data.profile) {
        setProfile(data.profile);
      } else {
        // Refresh if response format is different
        await refresh();
      }
      
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save profile");
      throw e;
    } finally {
      setSaving(false);
    }
  }, [refresh]);

  return { profile, loading, error, saving, refresh, save };
}
