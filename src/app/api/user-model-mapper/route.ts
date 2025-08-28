import { NextRequest } from "next/server";

const BASE = (process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
if (!BASE) {
	throw new Error("Missing BACKEND_API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL) env var");
}
const TARGET = `${BASE}/api/user-model-mapper`;

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const qs = url.search ? url.search : "";
	const cookie = req.headers.get("cookie") || "";
	const res = await fetch(`${TARGET}${qs}`, {
		method: "GET",
		headers: { "content-type": "application/json", cookie },
		credentials: "include",
	});
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
}

export async function POST(req: NextRequest) {
	const cookie = req.headers.get("cookie") || "";
	const res = await fetch(TARGET, {
		method: "POST",
		headers: { "content-type": "application/json", cookie },
		credentials: "include",
		body: await req.text(),
	});
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
}
