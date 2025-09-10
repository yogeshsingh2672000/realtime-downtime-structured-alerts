import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const qs = url.search ? url.search : "";
    const targetUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-model-mapper${qs}`;
    
    // Get Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Make API call to external endpoint using fetch
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
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
    console.error('User Model Mapper API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error in user model mapper API route',
        hint: 'Error occurred while processing user model mapper request in Next.js API route',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-model-mapper`;
    
    // Get Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Make API call to external endpoint using fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
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
    console.error('User Model Mapper API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error in user model mapper API route',
        hint: 'Error occurred while processing user model mapper request in Next.js API route',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
    }
}
