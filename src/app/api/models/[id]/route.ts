import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

const globalAny = globalThis as any;
if (!globalAny.__modelsStore) {
  globalAny.__modelsStore = new Map<string, any[]>();
}
const sessionIdToModels: Map<string, any[]> = globalAny.__modelsStore;

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  if (!sessionId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const items = sessionIdToModels.get(sessionId) ?? [];
  const next = items.map((m: any) =>
    m.id === id ? { ...m, ...body, updated_at: Date.now() } : m
  );
  sessionIdToModels.set(sessionId, next);
  const updated = next.find((m: any) => m.id === id);
  return NextResponse.json({ item: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await getSessionId();
  if (!sessionId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = sessionIdToModels.get(sessionId) ?? [];
  const next = items.filter((m: any) => m.id !== id);
  sessionIdToModels.set(sessionId, next);
  return NextResponse.json({ ok: true });
}
