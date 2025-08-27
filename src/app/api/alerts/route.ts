import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type AlertDestination = {
  id: string;
  email: string;
  llmProvider: string;
  model: string;
  createdAt: number;
};

// In-memory store keyed by sessionId; use global to persist across route modules
const globalAny = globalThis as any;
if (!globalAny.__alertsStore) {
  globalAny.__alertsStore = new Map<string, any[]>();
}
const sessionIdToAlerts: Map<string, AlertDestination[]> = globalAny.__alertsStore;

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

function generateId(): string {
  return `alert_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export async function GET() {
  const sessionId = await getSessionId();
  if (!sessionId) return NextResponse.json({ items: [] });
  const items = sessionIdToAlerts.get(sessionId) ?? [];
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  if (!sessionId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.llmProvider !== "string" || typeof body.model !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const newItem: AlertDestination = {
    id: generateId(),
    email: body.email,
    llmProvider: body.llmProvider,
    model: body.model,
    createdAt: Date.now(),
  };
  const existing = sessionIdToAlerts.get(sessionId) ?? [];
  sessionIdToAlerts.set(sessionId, [newItem, ...existing]);
  return NextResponse.json({ item: newItem }, { status: 201 });
}


