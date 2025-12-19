import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Make sure JWT_SECRET is set in your .env file
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  throw new Error('JWT_SECRET is not configured');
}
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    // Ensure the request has JSON content-type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { message: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        administrators: true,
      },
    });

    if (!user) {
      // Use the same error message for both invalid email and password for security
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return NextResponse.json(
        { message: 'An error occurred during login' },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          isAdmin: !!user.administrators 
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Check if user is an admin
      const isAdmin = !!user.administrators;
      
      console.log('User administrators:', user.administrators); // Debug log
      console.log('Is admin:', isAdmin); // Debug log
      
      // Create response with user data
      const response = NextResponse.json(
        { 
          message: 'Login successful', 
          user: { 
            id: user.id, 
            email: user.email, 
            username: user.username,
            isAdmin: isAdmin
          } 
        },
        { status: 200 }
      );
      
      console.log('Login response - isAdmin:', isAdmin); // Debug log

      // Set HTTP-only cookie
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    } catch (error) {
      console.error('Error generating token:', error);
      return NextResponse.json(
        { message: 'An error occurred during login' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
