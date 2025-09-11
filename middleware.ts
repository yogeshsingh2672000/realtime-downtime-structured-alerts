import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard") || 
                     request.nextUrl.pathname.startsWith("/profile") ||
                     request.nextUrl.pathname.startsWith("/models");
  if (!isProtected) return NextResponse.next();
  
  // For protected routes, let the client-side authentication handle the redirect
  // The middleware should not block access since authentication is handled client-side
  // with JWT tokens stored in memory
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/models/:path*"],
};


