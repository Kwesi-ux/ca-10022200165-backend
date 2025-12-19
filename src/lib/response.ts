import { NextResponse } from 'next/server';

export function jsonWithCors(req: any, body: any, init?: ResponseInit) {
  const origin = (req?.headers?.get && req.headers.get('origin')) || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const extraHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
  };

  const mergedHeaders = {
    ...(init && (init.headers as Record<string, string>)) ,
    ...extraHeaders,
  };

  return NextResponse.json(body, { ...(init || {}), headers: mergedHeaders });
}

export function preflightResponse(req: any) {
  const origin = (req?.headers?.get && req.headers.get('origin')) || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}
