import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };
}

export function handleCors(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(origin || undefined),
    });
  }
  
  return corsHeaders(origin || undefined);
}
