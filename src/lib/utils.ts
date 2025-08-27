function withBaseUrl(input: RequestInfo | URL): string | URL {
  if (typeof input === "string") {
    // const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
    const base = "https://realtime-downtime-structured-alerts-cjc5.onrender.com";
    if (input.startsWith("/")) return `${base}${input}`;
  }
  return input instanceof URL ? input : new URL(String(input));
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


