import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const questions = [
  "Does this product come with a warranty?",
  "Is this product available in other colors?",
  "How long does the battery last?",
  "Is this suitable for beginners?",
  "Does it work with international voltage?",
  "What are the dimensions of this product?",
  "Is this product compatible with Mac?",
  "How long does shipping usually take?",
  "Can this be used outdoors?",
  "Does this require assembly?",
  "Is this product good for sensitive skin?",
  "Are spare parts available for this?",
  "Can I return this if I'm not satisfied?",
  "Does this come with a user manual?",
  "What material is this made of?"
]

const answers = [
  "Yes, this product comes with a 1-year manufacturer warranty.",
  "Currently it's only available in the colors shown, but we'll have more options soon!",
  "The battery typically lasts 8-10 hours of continuous use.",
  "Absolutely! It's designed to be user-friendly for all skill levels.",
  "Yes, it works with 110-240V and comes with international adapters.",
  "The dimensions are 10\" x 8\" x 3\" (L x W x H).",
  "Yes, fully compatible with all Mac systems.",
  "Standard shipping takes 3-5 business days within the US.",
  "It's weather-resistant and suitable for outdoor use.",
  "Minimal assembly required - instructions and tools included.",
  "Yes, it's hypoallergenic and tested for sensitive skin.",
  "Spare parts can be ordered directly from our customer service team.",
  "We offer a 30-day satisfaction guarantee with free returns.",
  "Yes, a detailed user manual is included in the package.",
  "It's made of high-quality, eco-friendly materials that are built to last."
]

async function seedQuestions() {
  try {
    console.log('Seeding product questions and answers...')
    
    // Get the same 10 products we added reviews to
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
    
    // Current date for question date
    const currentDate = new Date()
    
    // Create questions from UserId 14 with answers
    for (const product of products) {
      const randomQuestionIndex = Math.floor(Math.random() * questions.length)
      const randomQuestion = questions[randomQuestionIndex]
      const matchingAnswer = answers[randomQuestionIndex]
      
      await prisma.productQuestion.create({
        data: {
          productId: product.id,
          userId: 14,
          question: randomQuestion,
          answer: matchingAnswer,
          questionDate: currentDate
        }
      })
      console.log(`Added question and answer for Product ID ${product.id} by User ID 14`)
    }
    
    // Create questions from UserId 2 with answers
    for (const product of products) {
      const randomQuestionIndex = Math.floor(Math.random() * questions.length)
      const randomQuestion = questions[randomQuestionIndex]
      const matchingAnswer = answers[randomQuestionIndex]
      
      await prisma.productQuestion.create({
        data: {
          productId: product.id,
          userId: 2,
          question: randomQuestion,
          answer: matchingAnswer,
          questionDate: currentDate
        }
      })
      console.log(`Added question and answer for Product ID ${product.id} by User ID 2`)
    }
    
    console.log('Product questions and answers seeded successfully!')
  } catch (error) {
    console.error('Error seeding questions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding function
seedQuestions()
  .catch((error) => {
    console.error('Error running seed script:', error)
  }) 