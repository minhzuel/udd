import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const reviewComments = [
  "Absolutely love this product! It exceeded all my expectations.",
  "Great quality for the price. Highly recommend!",
  "Excellent product that works exactly as described.",
  "This is my second purchase and I'm still impressed with the quality.",
  "Fast shipping and the product is just perfect.",
  "The best product in this category. Worth every penny!",
  "Fantastic design and very durable. Will buy again.",
  "Exactly what I was looking for. Very satisfied with my purchase.",
  "Superb quality and excellent customer service.",
  "This product has made my life so much easier. Thank you!",
  "Amazing value for money. Will definitely recommend to friends.",
  "Very well made and looks exactly like the pictures.",
  "This product has exceeded my expectations in every way.",
  "Incredible quality and the design is simply beautiful.",
  "So happy with this purchase. It's perfect for my needs."
]

async function seedReviews() {
  try {
    console.log('Seeding product reviews...')
    
    // Check if users with ID 14 and 2 exist
    const user14 = await prisma.user.findUnique({ where: { id: 14 } })
    const user2 = await prisma.user.findUnique({ where: { id: 2 } })
    
    if (!user14) {
      console.log('User ID 14 not found. Creating a sample user...')
      await prisma.user.create({
        data: {
          id: 14,
          fullName: 'Sample User 14',
          email: 'user14@example.com',
          password: 'password123',
          userType: 'customer',
          isVerified: true
        }
      })
    }
    
    if (!user2) {
      console.log('User ID 2 not found. Creating a sample user...')
      await prisma.user.create({
        data: {
          id: 2,
          fullName: 'Sample User 2',
          email: 'user2@example.com',
          password: 'password123',
          userType: 'customer',
          isVerified: true
        }
      })
    }
    
    // Get 10 products to add reviews to
    const products = await prisma.product.findMany({
      take: 10,
      orderBy: {
        id: 'asc'
      }
    })
    
    if (products.length === 0) {
      console.log('No products found. Please seed products first.')
      return
    }
    
    // Current date for review date
    const currentDate = new Date()
    
    // Create reviews for UserId 14
    for (const product of products) {
      const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)]
      
      await prisma.productReview.create({
        data: {
          productId: product.id,
          userId: 14,
          rating: 5, // 5 star as requested
          comment: randomComment,
          reviewDate: currentDate,
          status: 'approved' // Setting status to approved
        }
      })
      console.log(`Added 5-star review for Product ID ${product.id} by User ID 14`)
    }
    
    // Create reviews for UserId 2
    for (const product of products) {
      const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)]
      
      await prisma.productReview.create({
        data: {
          productId: product.id,
          userId: 2,
          rating: 5, // 5 star as requested
          comment: randomComment,
          reviewDate: currentDate,
          status: 'approved' // Setting status to approved
        }
      })
      console.log(`Added 5-star review for Product ID ${product.id} by User ID 2`)
    }
    
    console.log('Product reviews seeded successfully!')
  } catch (error) {
    console.error('Error seeding reviews:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding function
seedReviews()
  .catch((error) => {
    console.error('Error running seed script:', error)
  }) 