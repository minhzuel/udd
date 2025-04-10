import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserAvailablePoints } from '@/services/reward-points'

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
      where: { user_id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Get counts in parallel
    const [
      orderCount,
      reviewCount,
      availablePoints,
      questionCount
    ] = await Promise.all([
      // Count orders
      prisma.orders.count({
        where: { user_id: userId }
      }),
      
      // Count reviews
      prisma.product_reviews.count({
        where: { user_id: userId }
      }),
      
      // Get reward points
      getUserAvailablePoints(userId),
      
      // Count questions
      prisma.product_questions.count({
        where: { user_id: userId }
      })
    ])
    
    return NextResponse.json({
      orderCount,
      reviewCount,
      availablePoints,
      questionCount
    })
    
  } catch (error) {
    console.error('Error fetching account statistics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch account statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 