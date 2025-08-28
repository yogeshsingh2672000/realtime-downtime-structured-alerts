import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: number | null;
  date_of_birth: string | null; // ISO date (YYYY-MM-DD)
  admin: boolean | null;
  created_at: number;
  updated_at: number | null;
};

const globalAny = globalThis as any;
if (!globalAny.__userStore) {
  globalAny.__userStore = new Map<string, UserProfile>();
}
const sessionIdToUser: Map<string, UserProfile> = globalAny.__userStore;

async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  try {
    const parsed = JSON.parse(sessionCookie.value);
    return parsed.sessionId as string;
  } catch {
    return null;
  }
}

export async function GET() {
  const sessionId = await getSessionId();
  if (!sessionId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let profile = sessionIdToUser.get(sessionId);
  if (!profile) {
    profile = {
      id: sessionId,
      first_name: null,
      last_name: null,
      email: null,
      phone_number: null,
      date_of_birth: null,
      admin: null,
      created_at: Date.now(),
      updated_at: null,
    };
    sessionIdToUser.set(sessionId, profile);
  }
  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const sessionId = await getSessionId();
  if (!sessionId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const existing = sessionIdToUser.get(sessionId) as UserProfile | undefined;
  const next: UserProfile = {
    id: sessionId,
    first_name: body.first_name ?? existing?.first_name ?? null,
    last_name: body.last_name ?? existing?.last_name ?? null,
    email: body.email ?? existing?.email ?? null,
    phone_number: typeof body.phone_number === "number" ? body.phone_number : existing?.phone_number ?? null,
    date_of_birth: body.date_of_birth ?? existing?.date_of_birth ?? null,
    admin: typeof body.admin === "boolean" ? body.admin : existing?.admin ?? null,
    created_at: existing?.created_at ?? Date.now(),
    updated_at: Date.now(),
  };
  sessionIdToUser.set(sessionId, next);
  return NextResponse.json({ profile: next });
}
