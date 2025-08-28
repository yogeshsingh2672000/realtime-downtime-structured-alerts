import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

export async function GET(request: Request) {
  const corsResult = handleCors(request as any);
  
  // If it's an OPTIONS request, handleCors returns a NextResponse
  if (corsResult instanceof NextResponse) {
    return corsResult;
  }
  
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) {
    return NextResponse.json(
      { authenticated: false, user: null }, 
      { 
        status: 200,
        headers: corsResult
      }
    );
  }
  try {
    const parsed = JSON.parse(sessionCookie.value);
    return NextResponse.json(
      { authenticated: true, user: parsed.user }, 
      { 
        status: 200,
        headers: corsResult
      }
    );
  } catch {
    return NextResponse.json(
      { authenticated: false, user: null }, 
      { 
        status: 200,
        headers: corsResult
      }
    );
  }
}


