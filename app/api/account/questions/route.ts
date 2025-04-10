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

    const user = await prisma.users.findUnique({
      where: { user_id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get questions by the user
    const questions = await prisma.product_questions.findMany({
      where: {
        user_id: userId
      },
      include: {
        products: {
          select: {
            product_id: true,
            name: true,
            slug: true,
            main_image: true
          }
        },
        users: {
          select: {
            user_id: true,
            full_name: true
          }
        }
      },
      orderBy: {
        question_date: 'desc'
      }
    })
    
    // Map the questions data to include both snake_case and camelCase field names
    const formattedQuestions = questions.map(question => ({
      id: question.question_id,
      userId: question.user_id,
      productId: question.product_id,
      question: question.question,
      answer: question.answer,
      questionDate: question.question_date,
      product: {
        id: question.products.product_id,
        product_id: question.products.product_id,
        name: question.products.name,
        slug: question.products.slug,
        mainImage: question.products.main_image,
        main_image: question.products.main_image
      },
      user: {
        id: question.users.user_id,
        user_id: question.users.user_id,
        fullName: question.users.full_name
      }
    }));
    
    // Return the formatted questions data
    return NextResponse.json(formattedQuestions)
    
  } catch (error) {
    console.error('Error fetching user questions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 