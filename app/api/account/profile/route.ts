import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as z from 'zod'

const profileSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email().optional(),
  mobile_no: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    // Get session cookie directly from the request
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = parseInt(sessionCookie.value)
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid session' },
        { status: 401 }
      )
    }

    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { 
        customers: true,
        user_roles: {
          include: {
            admin_roles: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      mobile: user.mobile_no,
      profilePhotoUrl: user.profile_photo_url,
      userType: user.user_type,
      customerType: user.customers?.[0]?.customer_type || null,
      roles: user.user_roles.map(ur => ({
        id: ur.role_id,
        name: ur.admin_roles.role_name
      }))
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { message: 'An error occurred while fetching profile.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get session cookie directly from the request
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = parseInt(sessionCookie.value)
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid session' },
        { status: 401 }
      )
    }

    const user = await prisma.users.findUnique({
      where: { user_id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Transform input field names to match schema
    const transformedBody = {
      full_name: body.fullName,
      email: body.email,
      mobile_no: body.mobileNo
    }
    
    const result = profileSchema.safeParse(transformedBody)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: user.user_id },
      data: result.data
    })

    return NextResponse.json({
      id: updatedUser.user_id,
      name: updatedUser.full_name,
      email: updatedUser.email,
      mobile: updatedUser.mobile_no
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 