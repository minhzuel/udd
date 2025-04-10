import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getClientIP } from '@/lib/api'
import * as z from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().default(false),
})

const usernameLoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  rememberMe: z.boolean().default(false),
})

const mobileLoginSchema = z.object({
  mobile: z.string().min(10),
  otp: z.string().length(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIp = getClientIP(request)
    
    // Determine login type (email, username, or mobile)
    const isEmailLogin = 'email' in body;
    const isMobileLogin = 'mobile' in body && 'otp' in body;
    const isUsernameLogin = 'username' in body;
    
    let validatedData;
    if (isEmailLogin) {
      validatedData = loginSchema.parse(body);
    } else if (isMobileLogin) {
      validatedData = mobileLoginSchema.parse(body);
    } else if (isUsernameLogin) {
      validatedData = usernameLoginSchema.parse(body);
    } else {
      return NextResponse.json(
        { message: 'Invalid login method.' },
        { status: 400 }
      );
    }
    
    // Find user based on login method
    let user;
    if (isEmailLogin) {
      user = await prisma.users.findFirst({
        where: { email: validatedData.email },
        include: { 
          customers: true,
          user_roles: {
            include: {
              admin_roles: true
            }
          }
        },
      });
    } else if (isMobileLogin) {
      user = await prisma.users.findFirst({
        where: { mobile_no: validatedData.mobile },
        include: { 
          customers: true,
          user_roles: {
            include: {
              admin_roles: true
            }
          }
        },
      });
    } else {
      // Username login
      user = await prisma.users.findFirst({
        where: { 
          OR: [
            { full_name: validatedData.username },
            { email: validatedData.username }
          ] 
        },
        include: { 
          customers: true,
          user_roles: {
            include: {
              admin_roles: true
            }
          }
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 }
      )
    }

    // Handle authentication based on login method
    if (isMobileLogin) {
      // For mobile login, validate OTP
      // For demo, we'll check if OTP is 123456
      if (validatedData.otp !== '123456') {
        return NextResponse.json(
          { message: 'Invalid OTP.' },
          { status: 401 }
        )
      }
    } else {
      // For email/username login, check password
      if (!user.password) {
        return NextResponse.json(
          { message: 'Invalid credentials.' },
          { status: 401 }
        )
      }

      // Verify password
      const isValidPassword = await compare(validatedData.password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { message: 'Invalid credentials.' },
          { status: 401 }
        )
      }
    }

    // Check if user is verified
    if (!user.is_verified) {
      return NextResponse.json(
        { message: 'Your account is not verified. Please verify your account.' },
        { status: 401 }
      )
    }

    // Set session cookie
    const cookieMaxAge = (isEmailLogin || isUsernameLogin) && validatedData.rememberMe 
      ? 30 * 24 * 60 * 60 
      : 24 * 60 * 60; // 30 days if remember me, otherwise 1 day
    
    // Return user data (excluding sensitive information)
    const response = NextResponse.json({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      mobile: user.mobile_no,
      userType: user.user_type,
      customerType: user.customers?.[0]?.customer_type || null,
      roles: user.user_roles.map(ur => ({
        id: ur.role_id,
        name: ur.admin_roles.role_name
      }))
    });
    
    // Set session cookie directly in the response
    response.cookies.set('session', user.user_id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'An error occurred during login.' },
      { status: 500 }
    )
  }
} 