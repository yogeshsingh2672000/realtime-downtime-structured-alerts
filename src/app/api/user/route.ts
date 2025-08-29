// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`;
    
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
    
  } catch (error) {
    console.error('User API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error in user API route',
        hint: 'Error occurred while processing user request in Next.js API route',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`;
    
    // Make API call to external endpoint using fetch
    const response = await fetch(url, {
      method: 'PUT',
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
          ...errorData // Preserve any additional error fields from the actual API
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('User API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error in user API route',
        hint: 'Error occurred while processing user request in Next.js API route',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
