import { NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

// Simple mock user and session id generator
function generateSessionId(): string {
  return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export async function POST(request: Request) {
  const corsResult = handleCors(request as any);
  
  // If it's an OPTIONS request, handleCors returns a NextResponse
  if (corsResult instanceof NextResponse) {
    return corsResult;
  }
  
  const sessionId = generateSessionId();
  const mockUser = {
    id: "user_mock_google_1",
    name: "Mock Google User",
    email: "mock.user@gmail.com",
    provider: "google",
  };

  const response = NextResponse.json({ ok: true, user: mockUser });
  response.cookies.set("session", JSON.stringify({ sessionId, user: mockUser }), {
    httpOnly: true,
    sameSite: "none", // Changed from "lax" to "none" for cross-origin
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  
  // Add CORS headers
  Object.entries(corsResult).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}


