import { NextRequest } from "next/server";

const BASE = (process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
if (!BASE) {
	throw new Error("Missing BACKEND_API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL) env var");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const target = `${BASE}/api/user-model-mapper/${id}`;
	const cookie = req.headers.get("cookie") || "";
	const res = await fetch(target, {
		method: "PUT",
		headers: { "content-type": "application/json", cookie },
		credentials: "include",
		body: await req.text(),
	});
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const target = `${BASE}/api/user-model-mapper/${id}`;
	const cookie = req.headers.get("cookie") || "";
	const res = await fetch(target, {
		method: "DELETE",
		headers: { "content-type": "application/json", cookie },
		credentials: "include",
	});
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
}
