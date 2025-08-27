import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

// Share the same map across module instances if possible
const globalAny = globalThis as any;
if (!globalAny.__alertsStore) {
  globalAny.__alertsStore = new Map<string, any[]>();
}
const sessionIdToAlerts: Map<string, any[]> = globalAny.__alertsStore;

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = await getSessionId();
  if (!sessionId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const existing = sessionIdToAlerts.get(sessionId) ?? [];
  const next = existing.filter((a) => a.id !== id);
  sessionIdToAlerts.set(sessionId, next);
  return NextResponse.json({ ok: true });
}


