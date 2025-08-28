import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type ModelItem = {
  id: string;
  created_at: number;
  model_name: string | null;
  model_provider: string | null;
  updated_at: number | null;
  description: string | null;
  version: string | null;
  updated_by: string | null;
};

const globalAny = globalThis as any;
if (!globalAny.__modelsStore) {
  globalAny.__modelsStore = new Map<string, ModelItem[]>();
}
const sessionIdToModels: Map<string, ModelItem[]> = globalAny.__modelsStore;

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

function genId(): string {
  return `mdl_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export async function GET() {
  const sessionId = await getSessionId();
  if (!sessionId) return NextResponse.json({ items: [] });
  const items = sessionIdToModels.get(sessionId) ?? [];
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  if (!sessionId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const now = Date.now();
  const item: ModelItem = {
    id: genId(),
    created_at: now,
    model_name: body.model_name ?? null,
    model_provider: body.model_provider ?? null,
    updated_at: null,
    description: body.description ?? null,
    version: body.version ?? null,
    updated_by: body.updated_by ?? null,
  };
  const existing = sessionIdToModels.get(sessionId) ?? [];
  sessionIdToModels.set(sessionId, [item, ...existing]);
  return NextResponse.json({ item }, { status: 201 });
}
