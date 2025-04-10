import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET: Get addresses for the currently logged-in user
 */
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

    // Get addresses associated with the user
    const addresses = await prisma.addresses.findMany({
      where: { 
        user_id: userId,
        is_guest_address: false
      }
    })

    if (!addresses || addresses.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    // Transform snake_case field names to camelCase for frontend compatibility
    const transformedAddresses = addresses.map(address => ({
      id: address.address_id,
      fullName: address.full_name,
      mobileNo: address.mobile_no,
      address: address.address,
      city: address.city,
      userId: address.user_id,
      isGuestAddress: address.is_guest_address,
      isDefaultShipping: address.is_default_shipping,
      isDefaultBilling: address.is_default_billing,
      addressType: address.address_type,
      addressTitle: address.address_title
    }))

    return NextResponse.json(transformedAddresses)
  } catch (error) {
    console.error('Error fetching user addresses:', error)
    return NextResponse.json(
      { message: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

/**
 * POST: Create a new address for the currently logged-in user
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Handle default address settings if requested
    if (body.isDefaultShipping || body.isDefaultBilling) {
      // Clear other default addresses if this one is being set as default
      if (body.isDefaultShipping) {
        await prisma.addresses.updateMany({
          where: {
            user_id: userId,
            is_default_shipping: true
          },
          data: {
            is_default_shipping: false
          }
        })
      }
      
      if (body.isDefaultBilling) {
        await prisma.addresses.updateMany({
          where: {
            user_id: userId,
            is_default_billing: true
          },
          data: {
            is_default_billing: false
          }
        })
      }
    }
    
    // Create new address
    const address = await prisma.addresses.create({
      data: {
        full_name: body.fullName,
        mobile_no: body.mobile,
        address: body.address,
        city: body.city || '',
        user_id: userId,
        is_guest_address: false,
        is_default_shipping: body.isDefaultShipping || false,
        is_default_billing: body.isDefaultBilling || false,
        address_type: body.addressType || 'both',
        address_title: body.addressTitle || 'Home'
      }
    })

    // Transform the response to use camelCase for frontend compatibility
    const transformedAddress = {
      id: address.address_id,
      fullName: address.full_name,
      mobileNo: address.mobile_no,
      address: address.address,
      city: address.city,
      userId: address.user_id,
      isGuestAddress: address.is_guest_address,
      isDefaultShipping: address.is_default_shipping,
      isDefaultBilling: address.is_default_billing,
      addressType: address.address_type,
      addressTitle: address.address_title
    }

    return NextResponse.json(transformedAddress)
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { message: 'Failed to create address' },
      { status: 500 }
    )
  }
}

/**
 * PUT: Update an existing address
 */
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

    const body = await request.json()

    // Verify the address belongs to this user
    const existingAddress = await prisma.addresses.findFirst({
      where: {
        address_id: body.id,
        user_id: userId
      }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { message: 'Address not found or unauthorized' },
        { status: 404 }
      )
    }

    // Handle default address settings if requested
    if (body.isDefaultShipping || body.isDefaultBilling) {
      // Clear other default addresses if this one is being set as default
      if (body.isDefaultShipping) {
        await prisma.addresses.updateMany({
          where: {
            user_id: userId,
            is_default_shipping: true,
            address_id: { not: body.id }
          },
          data: {
            is_default_shipping: false
          }
        })
      }
      
      if (body.isDefaultBilling) {
        await prisma.addresses.updateMany({
          where: {
            user_id: userId,
            is_default_billing: true,
            address_id: { not: body.id }
          },
          data: {
            is_default_billing: false
          }
        })
      }
    }

    // Update the address
    const updatedAddress = await prisma.addresses.update({
      where: {
        address_id: body.id
      },
      data: {
        full_name: body.fullName,
        mobile_no: body.mobile,
        address: body.address,
        city: body.city,
        is_default_shipping: body.isDefaultShipping || false,
        is_default_billing: body.isDefaultBilling || false,
        address_type: body.addressType || 'both',
        address_title: body.addressTitle || 'Home'
      }
    })

    // Transform the response to use camelCase for frontend compatibility
    const transformedAddress = {
      id: updatedAddress.address_id,
      fullName: updatedAddress.full_name,
      mobileNo: updatedAddress.mobile_no,
      address: updatedAddress.address,
      city: updatedAddress.city,
      userId: updatedAddress.user_id,
      isGuestAddress: updatedAddress.is_guest_address,
      isDefaultShipping: updatedAddress.is_default_shipping,
      isDefaultBilling: updatedAddress.is_default_billing,
      addressType: updatedAddress.address_type,
      addressTitle: updatedAddress.address_title
    }

    return NextResponse.json(transformedAddress)
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { message: 'Failed to update address' },
      { status: 500 }
    )
  }
} 