import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * DELETE: Delete an address by ID for the currently logged-in user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const addressId = parseInt(params.id)
    
    if (isNaN(addressId)) {
      return NextResponse.json(
        { message: 'Invalid address ID' },
        { status: 400 }
      )
    }

    // Verify the address belongs to this user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId
      }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { message: 'Address not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete the address
    await prisma.address.delete({
      where: {
        id: addressId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { message: 'Failed to delete address' },
      { status: 500 }
    )
  }
} 