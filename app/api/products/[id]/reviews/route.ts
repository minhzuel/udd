import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import * as z from 'zod'

// Validation schema for review submission
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    
    // Get query parameters
    const url = new URL(request.url);
    const showAll = url.searchParams.get('showAll') === 'true';
    const countOnly = url.searchParams.get('count') === 'true';
    
    // Extract product ID first to prevent the Next.js warning
    const productId = parseInt(params.id);
    
    console.log(`[Reviews API] Fetching reviews for product ID: ${productId}, showAll: ${showAll}, countOnly: ${countOnly}`);
    
    // Get user ID for checking if user is admin/logged in
    const userId = await getSessionUserId(request);
    
    // Validate product ID
    if (isNaN(productId)) {
      console.log(`[Reviews API] Invalid product ID: ${productId}`);
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    console.log(`[Reviews API] Parsed product ID: ${productId}`);

    // If just returning count and average, use aggregation
    if (countOnly) {
      try {
        console.log(`[Reviews API] Fetching review stats for product ID: ${productId}`);
        
        // Get reviews directly to calculate stats more accurately
        const reviews = await prisma.product_reviews.findMany({
          where: {
            product_id: productId,
            status: 'approved', // Only count approved reviews
          },
          select: {
            rating: true
          }
        });

        console.log(`[Reviews API] Found ${reviews.length} approved reviews for stats`);

        // Calculate average manually to ensure accuracy
        let sum = 0;
        let count = reviews.length;
        
        reviews.forEach(review => {
          if (review.rating) {
            sum += review.rating;
          }
        });

        const avgRating = count > 0 ? sum / count : 0;

        return NextResponse.json({
          avgRating: avgRating || 0,
          totalCount: count || 0
        });
      } catch (aggregateError) {
        console.error('[Reviews API] Error calculating review statistics:', aggregateError);
        return NextResponse.json({
          avgRating: 0,
          totalCount: 0
        });
      }
    }

    // Fetch reviews with user information
    try {
      console.log(`[Reviews API] Fetching full reviews for product ID: ${productId}`);
      
      // Debug raw query first
      const rawReviews = await prisma.$queryRaw`
        SELECT * FROM product_reviews WHERE product_id = ${productId}
      `;
      console.log(`[Reviews API] Raw reviews query result:`, JSON.stringify(rawReviews));
      
      const whereClause = showAll 
        ? { product_id: productId }
        : { product_id: productId, status: 'approved' };
        
      console.log(`[Reviews API] Using where clause:`, JSON.stringify(whereClause));
      
      const reviews = await prisma.product_reviews.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              user_id: true,
              full_name: true,
              email: true
            },
          },
        },
        orderBy: {
          review_date: 'desc',
        },
      });

      console.log(`[Reviews API] Found ${reviews.length} reviews. First review:`, 
        reviews.length > 0 ? JSON.stringify(reviews[0]) : 'No reviews');

      // If no reviews found, return empty array
      if (!reviews || reviews.length === 0) {
        console.log(`[Reviews API] No reviews found for product ID: ${productId}`);
        return NextResponse.json([]);
      }

      // Transform data to match expected format
      const formattedReviews = reviews.map(review => ({
        id: review.review_id,
        rating: review.rating || 0,
        comment: review.comment || '',
        date: review.review_date,
        status: review.status,
        user: {
          id: review.users?.user_id,
          name: review.users?.full_name || 'Anonymous',
        }
      }));

      console.log(`[Reviews API] Returning ${formattedReviews.length} formatted reviews`);
      return NextResponse.json(formattedReviews);
    } catch (fetchError) {
      console.error('[Reviews API] Error fetching reviews:', fetchError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('[Reviews API] Error in reviews API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    
    // Extract product ID first to prevent the Next.js warning
    const productId = parseInt(params.id);
    
    console.log(`[Reviews API] Processing review submission for product ID: ${productId}`);
    
    // Get user ID from session
    const userId = await getSessionUserId(request)
    
    // Check if user is authenticated
    if (!userId) {
      console.log(`[Reviews API] Authentication required for review submission`);
      return NextResponse.json(
        { error: 'Authentication required to submit a review' },
        { status: 401 }
      )
    }
    
    console.log(`[Reviews API] Authenticated user ID: ${userId}`);
    
    // Validate product ID
    if (isNaN(productId)) {
      console.log(`[Reviews API] Invalid product ID: ${productId}`);
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Get the request body
    const body = await request.json()
    console.log(`[Reviews API] Review submission data:`, JSON.stringify(body));
    
    // Validate request data
    try {
      reviewSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(`[Reviews API] Validation error:`, JSON.stringify(error.errors));
        return NextResponse.json(
          { 
            error: 'Validation error', 
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      }
      throw error;
    }
    
    const { rating, comment } = body;

    // Check if user has already reviewed this product
    console.log(`[Reviews API] Checking for existing review from user ID ${userId} for product ID ${productId}`);
    const existingReview = await prisma.product_reviews.findFirst({
      where: {
        product_id: productId,
        user_id: userId,
      },
    })

    if (existingReview) {
      console.log(`[Reviews API] Updating existing review ID: ${existingReview.review_id}`);
      // Update existing review
      const updatedReview = await prisma.product_reviews.update({
        where: {
          review_id: existingReview.review_id,
        },
        data: {
          rating,
          comment,
          review_date: new Date(),
          status: 'approved' // Ensure status is set
        },
        include: {
          users: {
            select: {
              user_id: true,
              full_name: true,
              email: true
            },
          },
        },
      })

      // Transform to expected format
      const formattedReview = {
        id: updatedReview.review_id,
        rating: updatedReview.rating || 0,
        comment: updatedReview.comment || '',
        date: updatedReview.review_date,
        status: updatedReview.status,
        user: {
          id: updatedReview.users?.user_id,
          name: updatedReview.users?.full_name || 'Anonymous',
        }
      };

      console.log(`[Reviews API] Review updated successfully. Returning:`, JSON.stringify(formattedReview));
      return NextResponse.json(formattedReview, { status: 200 })
    }

    console.log(`[Reviews API] Creating new review for user ID ${userId} and product ID ${productId}`);
    // Create new review
    const review = await prisma.product_reviews.create({
      data: {
        product_id: productId,
        user_id: userId,
        rating,
        comment,
        review_date: new Date(),
        status: 'approved' // Set default status
      },
      include: {
        users: {
          select: {
            user_id: true,
            full_name: true,
            email: true
          },
        },
      },
    })

    // Transform to expected format
    const formattedReview = {
      id: review.review_id,
      rating: review.rating || 0,
      comment: review.comment || '',
      date: review.review_date,
      status: review.status,
      user: {
        id: review.users?.user_id,
        name: review.users?.full_name || 'Anonymous',
      }
    };

    console.log(`[Reviews API] Review created successfully. Returning:`, JSON.stringify(formattedReview));
    return NextResponse.json(formattedReview, { status: 201 })
  } catch (error) {
    console.error('[Reviews API] Error creating/updating product review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
} 