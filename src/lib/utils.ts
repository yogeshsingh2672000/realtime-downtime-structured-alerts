export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
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


