import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session cookie directly from the request
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
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
    
    // Validate conversation ID - unwrap params properly
    let conversationId: number
    try {
      // Use the id from context.params directly
      conversationId = parseInt(params.id)
      if (isNaN(conversationId) || conversationId <= 0) {
        throw new Error('Invalid conversation ID')
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Invalid conversation ID format' },
        { status: 400 }
      )
    }
    
    // Check if conversation exists and belongs to user
    try {
      const conversation = await prisma.chat_conversations.findFirst({
        where: {
          id: conversationId,
          user_id: userId
        }
      })
      
      if (!conversation) {
        return NextResponse.json(
          { error: 'Not found', message: 'Conversation not found or you do not have access to it' },
          { status: 404 }
        )
      }

      // Parse query parameters safely
      const url = new URL(request.url)
      let page = 1
      let limit = 50
      
      try {
        const pageParam = url.searchParams.get('page')
        if (pageParam) {
          const parsedPage = parseInt(pageParam)
          if (!isNaN(parsedPage) && parsedPage > 0) {
            page = parsedPage
          }
        }
        
        const limitParam = url.searchParams.get('limit')
        if (limitParam) {
          const parsedLimit = parseInt(limitParam)
          if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
            limit = parsedLimit
          }
        }
      } catch (parseError) {
        console.warn('Error parsing pagination params, using defaults:', parseError)
      }
      
      const skip = (page - 1) * limit
      
      // Fetch messages for the conversation
      try {
        console.log(`Fetching messages for conversation ${conversationId} with skip=${skip}, limit=${limit}`)
        const messages = await prisma.chat_messages.findMany({
          where: {
            conversation_id: conversationId
          },
          select: {
            id: true,
            content: true,
            message_type: true,
            timestamp: true,
            is_from_customer: true,
            attachment_url: true,
            attachment_type: true,
            is_read: true,
            read_at: true,
            is_seen: true,
            seen_at: true
          },
          orderBy: {
            timestamp: 'desc'
          },
          skip: skip,
          take: limit
        })
        
        console.log(`Retrieved ${messages.length} messages`)
        
        // Mark all unread messages as read and update the conversation
        if (page === 1) {
          try {
            // Update the conversation to mark as read
            await prisma.chat_conversations.update({
              where: {
                id: conversationId
              },
              data: {
                unread_count: 0,
                status: conversation.status === 'awaiting_reply' && !messages.some(m => !m.is_from_customer) 
                  ? 'open' 
                  : conversation.status
              }
            })
          } catch (updateError) {
            console.error('Error updating conversation read status:', updateError)
            // Continue execution even if update fails
          }
        }
        
        // Get total messages count for pagination
        let totalCount = 0
        try {
          totalCount = await prisma.chat_messages.count({
            where: {
              conversation_id: conversationId
            }
          })
        } catch (countError) {
          console.error('Error counting messages:', countError)
          // Use length as fallback if count fails
          totalCount = messages.length
        }

        // Get conversation details including order and product info
        const conversationDetails = await prisma.chat_conversations.findUnique({
          where: {
            id: conversationId
          },
          select: {
            title: true,
            orders: conversation.order_id ? {
              select: {
                order_id: true,
                guest_id: true,
                order_date: true,
                total_amount: true,
                order_status: true
              }
            } : false,
            products: conversation.product_id ? {
              select: {
                product_id: true,
                name: true,
                slug: true,
                main_image: true
              }
            } : false
          }
        })

        // Add read status to messages
        const messagesWithStatus = messages.map(message => ({
          ...message,
          readStatus: !message.is_from_customer ? 'read' : 
                    message.is_read ? 'read' : 
                    message.is_seen ? 'delivered' : 'sent'
        }))
        
        return NextResponse.json({
          messages: messagesWithStatus.reverse(), // Return in chronological order
          pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
          },
          title: conversationDetails?.title || 'Chat Support',
          order: conversationDetails?.orders || null,
          product: conversationDetails?.products || null
        })
      } catch (messageFetchError) {
        console.error('Specific error fetching messages:', messageFetchError)
        throw messageFetchError
      }
    } catch (dbError) {
      console.error('Database error when accessing messages:', dbError)
      return NextResponse.json(
        { error: 'Database error', message: 'Error retrieving messages' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unhandled error fetching chat messages:', error)
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session cookie directly from the request
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
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
    
    // Validate conversation ID - make sure to await params
    let conversationId: number
    try {
      // Get params safely
      const id = params.id
      conversationId = parseInt(id)
      if (isNaN(conversationId) || conversationId <= 0) {
        throw new Error('Invalid conversation ID')
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Invalid conversation ID format' },
        { status: 400 }
      )
    }
    
    try {
      // Check if conversation exists and belongs to user
      console.log(`Checking conversation ${conversationId} for user ${userId}`)
      const conversation = await prisma.chat_conversations.findFirst({
        where: {
          id: conversationId,
          user_id: userId
        }
      })
      
      if (!conversation) {
        return NextResponse.json(
          { error: 'Not found', message: 'Conversation not found or you do not have access to it' },
          { status: 404 }
        )
      }
      
      // Handle both form data and JSON
      let content = '';
      let messageType = 'text';
      let attachment: File | null = null;
      let formData;
      let orderId: number | null = null;
      
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        // Process JSON input
        try {
          const jsonData = await request.json();
          content = jsonData.content || '';
          messageType = jsonData.messageType || 'text';
          orderId = jsonData.orderId ? parseInt(jsonData.orderId) : null;
          
          if (isNaN(orderId)) {
            return NextResponse.json(
              { error: 'Bad request', message: 'Invalid order ID' },
              { status: 400 }
            )
          }
          
          // Validate the order belongs to this user if an orderId is provided
          if (orderId) {
            const order = await prisma.orders.findFirst({
              where: {
                order_id: orderId,
                user_id: userId
              }
            });
            
            if (!order) {
              return NextResponse.json(
                { error: 'Forbidden', message: 'You can only reference orders that belong to you' },
                { status: 403 }
              );
            }
          }
          
          console.log('Processing JSON data:', { content, messageType, orderId });
        } catch (parseError) {
          console.error('Error parsing JSON body:', parseError)
          return NextResponse.json(
            { error: 'Bad request', message: 'Invalid JSON payload' },
            { status: 400 }
          )
        }
      } else if (contentType.includes('multipart/form-data')) {
        // Process form data
        try {
          formData = await request.formData();
          content = (formData.get('content') as string) || '';
          messageType = (formData.get('messageType') as string) || 'text';
          attachment = formData.get('attachment') as File | null;
          console.log('Processing form data:', { content, messageType, hasAttachment: !!attachment });
        } catch (formError) {
          console.error('Error parsing form data:', formError);
          return NextResponse.json(
            { error: 'Bad request', message: 'Invalid form data' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Bad request', message: 'Unsupported content type' },
          { status: 400 }
        );
      }
      
      // Validate content
      if (!content.trim() && messageType === 'text' && !attachment) {
        return NextResponse.json(
          { error: 'Bad request', message: 'Content or attachment is required' },
          { status: 400 }
        )
      }

      let attachmentUrl = null
      let attachmentType = null
      
      // Handle file attachment if present
      if (attachment) {
        // In a real implementation, upload to a storage service and get URL
        // For this example, we'll just simulate it with a mock URL
        try {
          const fileName = attachment.name.replace(/[^\w\d.-]/g, '_') // Sanitize filename
          attachmentUrl = `/uploads/${Date.now()}-${fileName}`
          
          // Determine attachment type based on MIME type
          if (attachment.type.startsWith('image/')) {
            attachmentType = 'image'
          } else if (attachment.type.startsWith('audio/')) {
            attachmentType = 'audio'
          } else if (attachment.type.startsWith('video/')) {
            attachmentType = 'video'
          } else {
            attachmentType = 'file'
          }
          
          // In a real implementation, save the file here
          // await saveFile(attachment, attachmentUrl)
        } catch (uploadError) {
          console.error('Error processing attachment:', uploadError)
          return NextResponse.json(
            { error: 'Upload failed', message: 'Failed to process attachment' },
            { status: 500 }
          )
        }
      }
      
      // Create the message with a transaction to ensure consistency
      const [message, updatedConversation] = await prisma.$transaction(async (tx) => {
        // Create the message
        const newMessage = await tx.chat_messages.create({
          data: {
            conversation_id: conversationId,
            content: content.trim(),
            message_type: messageType,
            timestamp: new Date(),
            is_from_customer: true,
            attachment_url: attachmentUrl || null,
            attachment_type: attachmentType || null
          }
        })
        
        // Update the conversation with latest message preview and timestamp
        const updated = await tx.chat_conversations.update({
          where: {
            id: conversationId
          },
          data: {
            last_message_preview: content.trim() ? 
              (content.length > 50 ? content.substring(0, 47) + '...' : content) : 
              `Sent ${attachmentType || 'attachment'}`,
            updated_at: new Date(),
            status: 'awaiting_reply',
            unread_count: 0, // Reset unread count for customer's own messages
            order_id: orderId || undefined // Only update if orderId is provided
          }
        })
        
        return [newMessage, updated]
      })
      
      // Add virtual read/seen status to the response
      const messageWithStatus = {
        ...message,
        readStatus: 'sent'
      }
      
      return NextResponse.json(messageWithStatus, { status: 201 })
    } catch (dbError) {
      console.error('Database error when saving message:', dbError)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to save message' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unhandled error sending message:', error)
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