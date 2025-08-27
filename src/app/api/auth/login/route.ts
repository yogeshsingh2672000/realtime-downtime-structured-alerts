import { NextResponse } from "next/server";

// Simple mock user and session id generator
function generateSessionId(): string {
  return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export async function POST() {
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
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}


