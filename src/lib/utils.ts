// Simple hardcoded API base URL for backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function withBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  // For local development, use localhost:4000
  // For production, use the environment variable
  if (typeof input === "string" && input.startsWith("/")) {
    return `${API_BASE_URL}${input}`;
  }
  return input;
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const url = withBaseUrl(input);
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });
  
  if (!res.ok) {
    let errorMessage = `Request failed with ${res.status}`;
    try {
      const data = (await res.json()) as any;
      if (data?.error) errorMessage = data.error;
    } catch {}
    throw new Error(errorMessage);
  }
  
  return res.json() as Promise<T>;
}

export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}


