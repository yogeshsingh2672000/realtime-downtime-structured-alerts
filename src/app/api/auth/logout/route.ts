import { NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function POST(request: Request) {
  const corsResult = handleCors(request as any);
  
  // If it's an OPTIONS request, handleCors returns a NextResponse
  if (corsResult instanceof NextResponse) {
    return corsResult;
  }
  
  const response = NextResponse.json({ ok: true });
  response.cookies.set("session", "", {
    httpOnly: true,
    sameSite: "none", // Changed from "lax" to "none" for cross-origin
    secure: true,
    path: "/",
    maxAge: 0,
  });
  
  // Add CORS headers
  Object.entries(corsResult).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}


