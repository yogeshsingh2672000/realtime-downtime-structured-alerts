import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard") || 
                     request.nextUrl.pathname.startsWith("/profile") ||
                     request.nextUrl.pathname.startsWith("/models");
  if (!isProtected) return NextResponse.next();
  
  // Check for the auth_flow_completed cookie that's set by the login API
  const authFlowCookie = request.cookies.get("auth_flow_completed");
  if (authFlowCookie?.value === "true") {
    return NextResponse.next();
  }
  
  // If no auth cookie, redirect to home
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/models/:path*"],
};


