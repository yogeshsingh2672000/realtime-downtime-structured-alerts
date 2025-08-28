import { NextResponse, NextRequest } from "next/server";

const globalAny = globalThis as any;
if (!globalAny.__alertsStore) {
  globalAny.__alertsStore = new Map<string, any[]>();
}
const alertsStore = globalAny.__alertsStore;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = alertsStore.get("alerts") ?? [];
  const next = existing.filter((a) => a.id !== id);
  alertsStore.set("alerts", next);
  return NextResponse.json({ ok: true });
}


