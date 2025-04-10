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
    
    // Get reviews by the user
    const reviews = await prisma.product_reviews.findMany({
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
        }
      },
      orderBy: {
        review_date: 'desc'
      }
    })
    
    // Map the reviews data to include both snake_case and camelCase field names
    const formattedReviews = reviews.map(review => ({
      id: review.review_id,
      userId: review.user_id,
      productId: review.product_id,
      rating: review.rating,
      comment: review.comment,
      reviewDate: review.review_date,
      status: review.status,
      product: {
        id: review.products.product_id,
        product_id: review.products.product_id,
        name: review.products.name,
        slug: review.products.slug,
        mainImage: review.products.main_image,
        main_image: review.products.main_image
      }
    }));
    
    // Return the formatted reviews data
    return NextResponse.json(formattedReviews)
    
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 