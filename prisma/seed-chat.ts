import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Seeding chat conversations and messages...')
    
    // Find a user to create conversations for
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.error('No users found in the database')
      return
    }
    
    // Find a product to link to a conversation
    const product = await prisma.product.findFirst()
    
    // Create chat conversations
    const conversation1 = await prisma.chatConversation.create({
      data: {
        userId: user.id,
        title: 'Order Status Inquiry',
        status: 'open',
        lastMessagePreview: 'Hello, I would like to check on my order status.',
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: product?.id
      }
    })
    
    const conversation2 = await prisma.chatConversation.create({
      data: {
        userId: user.id,
        title: 'Product Availability',
        status: 'awaiting_reply',
        lastMessagePreview: 'Do you have this product in stock?',
        unreadCount: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)  // 1 day ago
      }
    })
    
    // Create messages for conversation 1
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation1.id,
        content: 'Hello, I would like to check on my order status.',
        messageType: 'text',
        isFromCustomer: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: true,
        readAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        isSeen: true,
        seenAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000) // 1.5 hours ago
      }
    })
    
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation1.id,
        content: 'Hi there! I would be happy to help you check on your order. Could you please provide your order number?',
        messageType: 'text',
        isFromCustomer: false,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isRead: true,
        readAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000), // 30 minutes ago
        isSeen: true,
        seenAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000) // 30 minutes ago
      }
    })
    
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation1.id,
        content: 'My order number is #12345. Thank you for your help!',
        messageType: 'text',
        isFromCustomer: true,
        timestamp: new Date(Date.now() - 0.25 * 60 * 60 * 1000), // 15 minutes ago
        isRead: false,
        isSeen: false
      }
    })
    
    // Create messages for conversation 2
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation2.id,
        content: 'Do you have this product in stock?',
        messageType: 'text',
        isFromCustomer: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: true,
        readAt: new Date(Date.now() - 1.9 * 24 * 60 * 60 * 1000), // 1.9 days ago
        isSeen: true,
        seenAt: new Date(Date.now() - 1.9 * 24 * 60 * 60 * 1000) // 1.9 days ago
      }
    })
    
    console.log('Chat data seeded successfully!')
  } catch (error) {
    console.error('Error seeding chat data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 