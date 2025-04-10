import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get session cookie directly from the request
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'You must be logged in to access this resource' },
        { status: 401 }
      )
    }
    
    // Parse user ID with error handling
    let userId: number
    try {
      userId = parseInt(sessionCookie.value)
      if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID')
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid session', message: 'Your session is invalid or expired' },
        { status: 401 }
      )
    }

    // Verify user exists
    try {
      const user = await prisma.users.findUnique({
        where: { user_id: userId }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found', message: 'User account not found' },
          { status: 404 }
        )
      }
    } catch (dbError) {
      console.error('Database error when finding user:', dbError)
      return NextResponse.json(
        { error: 'Database error', message: 'Error verifying user account' },
        { status: 500 }
      )
    }
    
    // Get chat conversations for the user
    try {
      const conversations = await prisma.chat_conversations.findMany({
        where: {
          user_id: userId
        },
        select: {
          id: true,
          title: true,
          created_at: true,
          updated_at: true,
          status: true,
          product_id: true,
          order_id: true,
          last_message_preview: true,
          unread_count: true,
          products: productId => productId ? {
            select: {
              product_id: true,
              name: true,
              slug: true,
              main_image: true
            }
          } : false,
          orders: orderId => orderId ? {
            select: {
              order_id: true,
              guest_id: true,
              order_date: true,
              total_amount: true,
              order_status: true
            }
          } : false
        },
        orderBy: {
          updated_at: 'desc'
        }
      })
      
      return NextResponse.json(conversations)
    } catch (dbError) {
      console.error('Database error when fetching conversations:', dbError)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unhandled error fetching chat conversations:', error)
    return NextResponse.json(
      { 
        error: 'Server error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session cookie directly from the request
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'You must be logged in to access this resource' },
        { status: 401 }
      )
    }
    
    // Parse user ID with error handling
    let userId: number
    try {
      userId = parseInt(sessionCookie.value)
      if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID')
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid session', message: 'Your session is invalid or expired' },
        { status: 401 }
      )
    }

    // Parse the request body with error handling
    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    const { title, productId, orderId } = body
    
    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid input', message: 'Title is required' },
        { status: 400 }
      )
    }
    
    // Check if product exists if productId is provided
    if (productId !== undefined && productId !== null) {
      try {
        const product = await prisma.products.findUnique({
          where: { product_id: Number(productId) }
        })
        
        if (!product) {
          return NextResponse.json(
            { error: 'Not found', message: 'Product not found' },
            { status: 404 }
          )
        }
      } catch (dbError) {
        return NextResponse.json(
          { error: 'Invalid input', message: 'Invalid product ID' },
          { status: 400 }
        )
      }
    }
    
    // Check if order exists and belongs to user if orderId is provided
    if (orderId !== undefined && orderId !== null) {
      try {
        const order = await prisma.orders.findFirst({
          where: { 
            order_id: Number(orderId),
            user_id: userId  // Strict check: Must belong to the logged-in user
          }
        })
        
        if (!order) {
          return NextResponse.json(
            { error: 'Not found', message: 'Order not found or does not belong to you' },
            { status: 404 }
          )
        }
        
        // Only allow linking to this verified order
        productId = null; // Don't allow product linking when linking to an order
        
      } catch (dbError) {
        console.error('Error validating order ownership:', dbError);
        return NextResponse.json(
          { error: 'Invalid input', message: 'Invalid order ID' },
          { status: 400 }
        )
      }
    }
    
    // Create a new conversation
    try {
      const conversation = await prisma.chat_conversations.create({
        data: {
          user_id: userId,
          title: title.trim(),
          product_id: productId ? Number(productId) : null,
          order_id: orderId ? Number(orderId) : null,
          status: 'open',
          last_message_preview: 'Conversation started',
          unread_count: 0
        }
      })
      
      return NextResponse.json(conversation, { status: 201 })
    } catch (dbError) {
      console.error('Database error when creating conversation:', dbError)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to create conversation' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unhandled error creating conversation:', error)
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 