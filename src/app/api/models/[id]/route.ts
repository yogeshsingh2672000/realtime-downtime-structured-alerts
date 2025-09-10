import { NextResponse, NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/models/${id}`;
    
    // Get Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Make API call to external endpoint using fetch
    const response = await fetch(url, {
      method: 'PUT',
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
    console.error('Models PUT API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error in models PUT API route',
        hint: 'Error occurred while processing model update request in Next.js API route',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/models/${id}`;
    
    // Get Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Make API call to external endpoint using fetch
    const response = await fetch(url, {
      method: 'DELETE',
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

    // For DELETE operations, return the same status as the backend
    // Backend returns 204 No Content, so we return that too
    return new NextResponse(null, { status: response.status });
    
  } catch (error) {
    console.error('Models DELETE API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error in models DELETE API route',
        hint: 'Error occurred while processing model deletion request in Next.js API route',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
