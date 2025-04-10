import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Get the params object
    const { params } = context;
    
    // Extract product ID from parameters
    const productId = parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Fetch questions for this product
    const questions = await prisma.product_questions.findMany({
      where: {
        product_id: productId
      },
      orderBy: {
        question_date: 'desc'
      },
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true
          }
        }
      }
    })

    // Transform the data to match the expected format
    const formattedQuestions = questions.map(q => ({
      id: q.question_id.toString(),
      question: q.question || '',
      isAnswered: !!q.answer,
      createdAt: q.question_date?.toISOString() || new Date().toISOString(),
      user: {
        name: q.users?.full_name || 'Anonymous'
      },
      answer: q.answer ? {
        id: q.question_id.toString(), // Using same ID for simplicity
        answer: q.answer,
        createdAt: q.question_date?.toISOString() || new Date().toISOString(),
        user: {
          name: 'Store Admin'
        }
      } : null
    }))

    return NextResponse.json(formattedQuestions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Get the params object
    const { params } = context;
    
    // Get user ID from session
    const userId = await getSessionUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Please log in to submit a question' },
        { status: 401 }
      )
    }

    // Get product ID from parameters
    const productId = parseInt(params.id)
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { product_id: productId }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const data = await request.json()
    
    if (!data.question || typeof data.question !== 'string') {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      )
    }

    // Create the question
    const question = await prisma.product_questions.create({
      data: {
        product_id: productId,
        user_id: userId,
        question: data.question,
        question_date: new Date()
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        question: {
          id: question.question_id.toString(),
          question: question.question,
          isAnswered: false,
          createdAt: question.question_date?.toISOString() || new Date().toISOString(),
          user: null, // Will be fetched on next page load
          answer: null
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to submit question' },
      { status: 500 }
    )
  }
} 