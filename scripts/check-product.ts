import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProduct() {
  try {
    const productId = '00288714-8c98-41be-8f20-062ccd2807fe'
    
    console.log('Checking product with ID:', productId)
    
    const product = await prisma.ecommerceProduct.findUnique({
      where: { id: productId },
      include: {
        category: {
          include: {
            parent: true
          }
        },
        productImage: true,
        options: true,
        createdByUser: true,
        orderItems: true
      },
    })

    if (!product) {
      console.log('Product not found')
      return
    }

    console.log('Product found:', JSON.stringify(product, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProduct() 