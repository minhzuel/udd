import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

    // Parse query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '5')
    
    // First, try to fetch recently viewed products
    const recentlyViewedProducts = await prisma.productView.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        viewDate: 'desc'
      },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true
          }
        }
      },
      take: limit
    })
    
    if (recentlyViewedProducts.length > 0) {
      return NextResponse.json(
        recentlyViewedProducts.map(item => item.product)
      )
    }
    
    // If no recently viewed products, try to fetch from recent orders
    const recentOrderProducts = await prisma.orderItem.findMany({
      where: {
        order: {
          userId: userId
        }
      },
      orderBy: {
        order: {
          orderDate: 'desc'
        }
      },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true
          }
        }
      },
      distinct: ['productId'],
      take: limit
    })
    
    if (recentOrderProducts.length > 0) {
      return NextResponse.json(
        recentOrderProducts.map(item => item.product)
      )
    }
    
    // If no recent order products, fetch most popular products
    const popularProducts = await prisma.product.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        viewCount: 'desc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        mainImage: true
      },
      take: limit
    })
    
    return NextResponse.json(popularProducts)
    
  } catch (error) {
    console.error('Error fetching recent products:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch recent products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 