import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { BASE_API_URL } from '@/utils/apiurl';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backendRes = await fetch(`${BASE_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const token = data.token;

  const response = NextResponse.json({ message: 'Login successful' });

  // Set HttpOnly cookie
  response.headers.set(
    'Set-Cookie',
    serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })
  );

  return response;
}
