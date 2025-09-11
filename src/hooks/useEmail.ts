"use client";
import { useCallback, useState } from "react";
import { getTokens } from "@/lib/api";

export type EmailType = "downtime" | "uptime";

export interface EmailTriggerPayload {
  emailType: EmailType;
  emailAddress: string;
  modelName: string;
  duration?: string;
  serviceName?: string;
  additionalInfo?: string;
}

export interface EmailTriggerResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
  error?: string;
  emailId?: string;
  details?: {
    emailType: string;
    emailAddress: string;
    modelName: string;
    duration: string;
    timestamp: string;
  };
}

export function useEmail() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const triggerEmail = useCallback(async (payload: EmailTriggerPayload): Promise<EmailTriggerResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const { accessToken } = getTokens();
      
      const response = await fetch('/api/email/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data: EmailTriggerResponse = await response.json();
      console.log('Email API Response:', data); // Debug log
      return data;
    } catch (err: any) {
      const errorMessage = err?.message ?? "Failed to trigger email";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    triggerEmail,
    loading,
    error,
    clearError,
  };
}
