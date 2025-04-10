import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import * as z from 'zod'

// Validation schema for status update
const statusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
});

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

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
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
    
    // Validate review ID
    const reviewId = parseInt(context.params.id);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate status
    try {
      statusSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation error', 
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      throw error;
    }
    
    const { status } = body;
    
    // Check if review exists
    const existingReview = await prisma.productReview.findUnique({
      where: { id: reviewId }
    });
    
    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Update review status
    const updatedReview = await prisma.productReview.update({
      where: { id: reviewId },
      data: { status },
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
      }
    });
    
    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json(
      { error: 'Failed to update review status' },
      { status: 500 }
    );
  }
} 