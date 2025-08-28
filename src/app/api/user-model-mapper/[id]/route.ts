import { NextRequest } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const target = `${API_BASE}/api/user-model-mapper/${id}`;
	const res = await fetch(target, {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: await req.text(),
	});
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const target = `${API_BASE}/api/user-model-mapper/${id}`;
	const res = await fetch(target, {
		method: "DELETE",
		headers: { "content-type": "application/json" },
	});
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
}
