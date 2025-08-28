import { NextRequest } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
const TARGET = `${API_BASE}/api/user-model-mapper`;

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const qs = url.search ? url.search : "";
	const res = await fetch(`${TARGET}${qs}`, {
		method: "GET",
		headers: { "content-type": "application/json" },
		credentials: "include",
	});
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
}

export async function POST(req: NextRequest) {
	const res = await fetch(TARGET, {
		method: "POST",
		headers: { "content-type": "application/json" },
		credentials: "include",
		body: await req.text(),
	});
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
}
