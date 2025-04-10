import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
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
    
    // Validate conversation ID - get ID safely
    const id = context.params.id
    const conversationId = parseInt(id)
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID' },
        { status: 400 }
      )
    }
    
    // Get conversation data
    const conversation = await prisma.chat_conversations.findUnique({
      where: {
        id: conversationId,
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
        products: {
          select: {
            product_id: true,
            name: true,
            slug: true,
            main_image: true
          }
        },
        orders: {
          select: {
            order_id: true,
            guest_id: true,
            order_date: true,
            total_amount: true,
            order_status: true
          }
        }
      }
    })
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(conversation)
    
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
} 