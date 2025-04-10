import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { z } from 'zod'
import { NextRequest } from 'next/server'

// Validation schema for question answer
const answerSchema = z.object({
  answer: z.string().min(1, 'Answer is required').max(1000, 'Answer is too long')
})

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

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
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
    
    // Extract question ID from params
    const questionId = parseInt(context.params.id)
    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = answerSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    // Check if question exists
    const question = await prisma.productQuestion.findUnique({
      where: { id: questionId }
    })
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }
    
    // Update the question with the answer
    const updatedQuestion = await prisma.productQuestion.update({
      where: { id: questionId },
      data: {
        answer: validationResult.data.answer
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      question: {
        id: updatedQuestion.id.toString(),
        question: updatedQuestion.question,
        answer: updatedQuestion.answer,
        isAnswered: !!updatedQuestion.answer,
        user: {
          name: updatedQuestion.user?.fullName || 'Anonymous'
        }
      }
    })
  } catch (error) {
    console.error('Error answering question:', error)
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    )
  }
} 