import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  if (!isDashboard) return NextResponse.next();
  const sessionCookie = request.cookies.get("session");
  try {
    const parsed = sessionCookie?.value ? JSON.parse(sessionCookie.value) : null;
    if (parsed?.sessionId) return NextResponse.next();
  } catch {}
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};


