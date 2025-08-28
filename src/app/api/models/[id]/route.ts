import { NextResponse, NextRequest } from "next/server";

const globalAny = globalThis as any;
if (!globalAny.__modelsStore) {
  globalAny.__modelsStore = new Map<string, any[]>();
}
const modelsStore: Map<string, any[]> = globalAny.__modelsStore;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  
  const items = modelsStore.get("models") ?? [];
  const next = items.map((m: any) =>
    m.id === id ? { ...m, ...body, updated_at: Date.now() } : m
  );
  modelsStore.set("models", next);
  const updated = next.find((m: any) => m.id === id);
  return NextResponse.json({ item: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = modelsStore.get("models") ?? [];
  const next = items.filter((m: any) => m.id !== id);
  modelsStore.set("models", next);
  return NextResponse.json({ ok: true });
}
