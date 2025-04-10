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
    
    // Get available points
    const availablePoints = await getUserAvailablePoints(userId)
    
    // Get reward points history
    const rewardPointsHistory = await prisma.reward_points.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        earned_date: 'desc'
      },
      select: {
        reward_point_id: true,
        points: true,
        earned_date: true,
        expiry_date: true,
        is_used: true,
        order_id: true,
        orders: {
          select: {
            order_id: true,
            order_date: true,
            total_amount: true
          }
        }
      },
      take: 100,
      skip: 0
    })
    
    // Return reward points data
    return NextResponse.json({
      availablePoints,
      history: rewardPointsHistory.map(point => ({
        id: point.reward_point_id,
        points: point.points,
        earnedDate: point.earned_date,
        expiryDate: point.expiry_date,
        isUsed: point.is_used,
        orderId: point.order_id,
        orderDate: point.orders?.order_date,
        orderAmount: point.orders?.total_amount
      }))
    })
  } catch (error) {
    console.error('Error fetching reward points:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch reward points',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 