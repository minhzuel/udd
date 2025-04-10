import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

// Helper function to check if user is an admin
async function isAdmin(userId: number): Promise<boolean> {
  try {
    // Check if user has admin role
    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!userWithRoles) return false
    
    // Check if any of the user's roles include admin permissions
    return userWithRoles.userRoles.some(
      userRole => userRole.role.name.toLowerCase().includes('admin')
    )
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function GET(request: Request) {
  try {
    // Get user ID from session
    const userId = await getSessionUserId(request)
    
    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user is an admin
    const adminStatus = await isAdmin(userId)
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }
    
    // Parse query parameters
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId') ? parseInt(url.searchParams.get('productId') || '0') : null
    const answeredFilter = url.searchParams.get('answered')
    const search = url.searchParams.get('search')
    
    // Build filter conditions
    const whereCondition: any = {}
    
    // Filter by product ID if provided
    if (productId && !isNaN(productId)) {
      whereCondition.productId = productId
    }
    
    // Filter by answered status if provided
    if (answeredFilter === 'true') {
      whereCondition.answer = { not: null }
    } else if (answeredFilter === 'false') {
      whereCondition.answer = null
    }
    
    // Add search functionality if provided
    if (search) {
      whereCondition.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }
    
    // Fetch questions with filtering
    const questions = await prisma.productQuestion.findMany({
      where: whereCondition,
      orderBy: [
        { answer: { sort: 'asc', nulls: 'first' } }, // Unanswered first
        { questionDate: 'desc' } // Then newest first
      ],
      include: {
        user: {
          select: {
            id: true,
            fullName: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            mainImage: true
          }
        }
      }
    })
    
    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
} 