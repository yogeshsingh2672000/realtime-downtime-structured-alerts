import { NextResponse } from "next/server";

type AlertDestination = {
  id: string;
  email: string;
  llmProvider: string;
  model: string;
  createdAt: number;
};

const globalAny = globalThis as any;
if (!globalAny.__alertsStore) {
  globalAny.__alertsStore = new Map<string, AlertDestination[]>();
}
const alertsStore = globalAny.__alertsStore;

function generateId(): string {
  return `alert_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export async function GET() {
  const items = alertsStore.get("alerts") ?? [];
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
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
  const existing = alertsStore.get("alerts") ?? [];
  alertsStore.set("alerts", [newItem, ...existing]);
  return NextResponse.json({ item: newItem }, { status: 201 });
}


