import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // ===== FIRST USER LOGIC - REMOVE THIS SECTION IN FUTURE =====
    // Check if user has been through login flow
    const hasLoggedIn = request.cookies.get('auth_flow_completed');
    
    // If this is first visit (no login completed), return not authenticated
    if (!hasLoggedIn) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        message: 'First visit - login required'
      }, { status: 200 });
    }
    // ===== END FIRST USER LOGIC =====

    // ===== ORIGINAL WORKING CODE - UNCOMMENT WHEN REMOVING FIRST USER LOGIC =====
    // const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/session`;
    // 
    // // Make API call to external endpoint using fetch
    // const response = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });
    // 
    // if (!response.ok) {
    //   // Forward the actual API error response structure
    //   const errorData = await response.json().catch(() => ({}));
    //   return NextResponse.json(
    //     {
    //       ...errorData // Preserve any additional error fields from the actual API
    //     },
    //     { status: response.status }
    //   );
    // }
    // 
    // const data = await response.json();
    // return NextResponse.json(data);
    // ===== END ORIGINAL WORKING CODE =====

    // ===== TEMPORARY MOCK RESPONSE - REMOVE WHEN RESTORING ORIGINAL CODE =====
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/session`;
    
    // Make API call to external endpoint using fetch
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Forward the actual API error response structure
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          ...errorData // Preserve any additional error fields from the actual API
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    // ===== END TEMPORARY MOCK RESPONSE =====
    
  } catch (error) {
    console.error('Session API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error in session API route',
        hint: 'Error occurred while processing session request in Next.js API route',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}


