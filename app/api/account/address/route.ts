import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/api'
import { systemLog } from '@/services/system-log'
import * as z from 'zod'
import { verifyJwtToken } from '@/lib/jwt'

const addressSchema = z.object({
  addressLine: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional()
})

// Get all addresses for the current user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await verifyJwtToken(token)
    if (!payload?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const addresses = await prisma.userAddress.findMany({
      where: { userId: user.id }
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { message: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

// Add a new address
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await verifyJwtToken(token)
    if (!payload?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = addressSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      )
    }

    const addressData = result.data

    // Check if this is the first address (should be default)
    const addressCount = await prisma.userAddress.count({
      where: { userId: user.id }
    })

    const address = await prisma.userAddress.create({
      data: {
        ...addressData,
        userId: user.id,
        isDefault: addressCount === 0 || addressData.isDefault
      }
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { message: 'Failed to create address' },
      { status: 500 }
    )
  }
}

// Update an address
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await verifyJwtToken(token)
    if (!payload?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...addressData } = body

    if (!id) {
      return NextResponse.json(
        { message: 'Address ID is required' },
        { status: 400 }
      )
    }

    const result = addressSchema.safeParse(addressData)
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      )
    }

    const existingAddress = await prisma.userAddress.findUnique({
      where: { id }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      )
    }

    if (existingAddress.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const address = await prisma.userAddress.update({
      where: { id },
      data: addressData
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { message: 'Failed to update address' },
      { status: 500 }
    )
  }
}

// Delete an address
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await verifyJwtToken(token)
    if (!payload?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Address ID is required' },
        { status: 400 }
      )
    }

    const existingAddress = await prisma.userAddress.findUnique({
      where: { id }
    })

    if (!existingAddress) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      )
    }

    if (existingAddress.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.userAddress.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { message: 'Failed to delete address' },
      { status: 500 }
    )
  }
} 