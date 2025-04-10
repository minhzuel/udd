import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import * as z from 'zod'

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  otp: z.string().length(6),
  registrationType: z.enum(['email', 'mobile']),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  mobile: z.string().min(10),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Received registration request:', body)
    
    // Validate input data
    const validatedData = registerSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Validate OTP (for demo purposes, using 123456)
    if (validatedData.otp !== '123456') {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log('Checking for existing user...')
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { mobileNo: validatedData.mobile }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email or mobile number' },
        { status: 400 }
      )
    }

    // Create user data based on registration type
    const userData: any = {
      fullName: validatedData.name,
      mobileNo: validatedData.mobile,
      userType: 'customer', // Using the user_type_enum directly
      isVerified: true,
    }

    if (validatedData.registrationType === 'email') {
      if (!validatedData.email || !validatedData.password) {
        return NextResponse.json(
          { message: 'Email and password are required for email registration' },
          { status: 400 }
        )
      }
      // Hash password for email registration
      const hashedPassword = await hash(validatedData.password, 12)
      userData.email = validatedData.email
      userData.password = hashedPassword
    }

    // Create user
    console.log('Creating user...')
    const user = await prisma.user.create({
      data: userData,
    })

    console.log('User created successfully:', user)

    // Create customer record linked to the user
    await prisma.customer.create({
      data: {
        userId: user.id,
        customerType: 'b2c', // Using the correct enum value from customer_type_enum
      }
    })

    return NextResponse.json(
      { 
        message: 'Registration successful', 
        user: { 
          id: user.id, 
          name: user.fullName, 
          email: user.email,
          mobile: user.mobileNo,
        } 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
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

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 