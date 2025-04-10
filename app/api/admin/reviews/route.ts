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
    });

    if (!userWithRoles) return false;
    
    // Check if any of the user's roles include admin permissions
    return userWithRoles.userRoles.some(
      userRole => userRole.role.name.toLowerCase().includes('admin')
    );
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    // Get user ID from session
    const userId = await getSessionUserId(request);
    
    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is an admin
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const whereCondition: any = {};
    
    // Filter by status if provided
    if (status && status !== 'all') {
      whereCondition.status = status;
    }
    
    // Add search functionality if provided
    if (search) {
      whereCondition.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    // Fetch reviews with pagination
    const reviews = await prisma.productReview.findMany({
      where: whereCondition,
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
            name: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },  // Show pending first
        { reviewDate: 'desc' }  // Then by date, newest first
      ],
      skip,
      take: limit
    });
    
    // Get total count for pagination
    const total = await prisma.productReview.count({
      where: whereCondition
    });
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
} 