import { NextResponse, NextRequest } from "next/server";

// Keep type aligned with src/app/api/alerts/route.ts
export type AlertDestination = {
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
const alertsStore: Map<string, AlertDestination[]> = globalAny.__alertsStore;

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const existing: AlertDestination[] = alertsStore.get("alerts") ?? [];
	const next = existing.filter((alert: AlertDestination) => alert.id !== id);
	alertsStore.set("alerts", next);
	return NextResponse.json({ ok: true });
}


