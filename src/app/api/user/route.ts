import { NextResponse } from "next/server";

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: number | null;
  date_of_birth: string | null;
  admin: boolean | null;
  created_at: number;
  updated_at: number | null;
};

const globalAny = globalThis as any;
if (!globalAny.__userStore) {
  globalAny.__userStore = new Map<string, UserProfile>();
}
const userStore = globalAny.__userStore;

export async function GET() {
  const profiles = Array.from(userStore.values());
  return NextResponse.json({ profiles });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const id = body.id || crypto.randomUUID();
  const existing = userStore.get(id);

  const next: UserProfile = {
    id,
    first_name: body.first_name ?? existing?.first_name ?? null,
    last_name: body.last_name ?? existing?.last_name ?? null,
    email: body.email ?? existing?.email ?? null,
    phone_number: typeof body.phone_number === "number" ? body.phone_number : existing?.phone_number ?? null,
    date_of_birth: body.date_of_birth ?? existing?.date_of_birth ?? null,
    admin: typeof body.admin === "boolean" ? body.admin : existing?.admin ?? null,
    created_at: existing?.created_at ?? Date.now(),
    updated_at: Date.now(),
  };
  userStore.set(id, next);
  return NextResponse.json({ profile: next });
}
