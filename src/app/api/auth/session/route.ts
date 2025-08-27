import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
  try {
    const parsed = JSON.parse(sessionCookie.value);
    return NextResponse.json({ authenticated: true, user: parsed.user }, { status: 200 });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}


