import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get session cookie directly from the request
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'You must be logged in to access this resource' },
        { status: 401 }
      )
    }
    
    // Parse user ID with error handling
    let userId: number
    try {
      userId = parseInt(sessionCookie.value)
      if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID')
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid session', message: 'Your session is invalid or expired' },
        { status: 401 }
      )
    }
    
    // Get only recent orders (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    // Get type from query params (all or recent)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: userId,
          ...(type === 'recent' ? {
            orderDate: {
              gte: sixMonthsAgo
            }
          } : {})
        },
        select: {
          id: true,
          orderNumber: true,
          orderDate: true,
          orderStatus: true,
          totalAmount: true,
          orderItems: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  mainImage: true
                }
              }
            },
            take: 1 // Just get the first item for preview
          }
        },
        orderBy: {
          orderDate: 'desc'
        },
        take: limit
      })
      
      // Map orderStatus to status for client compatibility
      // and map orderItems to items for client compatibility
      const mappedOrders = orders.map(order => ({
        ...order,
        status: order.orderStatus,
        items: order.orderItems
      }))
      
      return NextResponse.json(mappedOrders)
    } catch (dbError) {
      console.error('Database error when fetching orders:', dbError)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch orders' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unhandled error fetching orders:', error)
    return NextResponse.json(
      { 
        error: 'Server error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 