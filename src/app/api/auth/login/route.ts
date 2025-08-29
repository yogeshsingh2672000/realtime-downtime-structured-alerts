import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`;
    
    // Make API call to external endpoint using fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Forward the actual API error response structure
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          // success: false,
          // error: errorData.error || `Request failed with status ${response.status}`,
          // statusCode: response.status,
          ...errorData // Preserve any additional error fields from the actual API
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // ===== FIRST USER LOGIC - REMOVE THIS SECTION IN FUTURE =====
    // Create response with authentication flow cookie
    const loginResponse = NextResponse.json(data);
    
    // Set cookie to mark that user has completed login flow
    loginResponse.cookies.set('auth_flow_completed', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    
    return loginResponse;
    // ===== END FIRST USER LOGIC =====

    // ===== ORIGINAL WORKING CODE - UNCOMMENT WHEN REMOVING FIRST USER LOGIC =====
    // return NextResponse.json(data);
    // ===== END ORIGINAL WORKING CODE =====
    
  } catch (error) {
    console.error('Login API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error in login API route',
        hint: 'Error occurred while processing login request in Next.js API route',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}


