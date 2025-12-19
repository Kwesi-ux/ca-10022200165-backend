import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  throw new Error('JWT_SECRET is not configured');
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: Request) {
  try {
    // Get the token from cookies
    const cookies = request.headers.get('cookie') || '';
    const token = cookies
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    console.log('Session check - Token found:', !!token);

    if (!token) {
      console.log('No token found in cookies');
      return NextResponse.json({ user: null }, { status: 200, headers: { 'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3001', 'Access-Control-Allow-Credentials': 'true' } });
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          administrators: true,
        },
      });

      if (!user) {
        console.log('User not found in database');
        return NextResponse.json({ user: null }, { status: 200 });
      }

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;
      
      console.log('Session validated for user:', user.email);
      
      return NextResponse.json({
        user: {
          ...userWithoutPassword,
          isAdmin: !!user.administrators,
        },
      }, { headers: { 'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3001', 'Access-Control-Allow-Credentials': 'true' } });
      
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ 
        user: null,
        error: 'Invalid or expired session' 
      }, { status: 200, headers: { 'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3001', 'Access-Control-Allow-Credentials': 'true' } });
    }
    
  } catch (error) {
    console.error('Session error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        user: null, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500, headers: { 'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3001', 'Access-Control-Allow-Credentials': 'true' } }
    );
  }
}
