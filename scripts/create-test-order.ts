import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestOrder() {
  try {
    console.log('Creating test order...')

    // First, check if the product exists
    const product = await prisma.ecommerceProduct.findUnique({
      where: {
        id: '0c624eeb-11f8-4025-9825-d4618a690ebc'
      }
    })

    if (!product) {
      console.error('Product not found')
      return
    }

    console.log('Found product:', product)

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        fullName: 'Test User',
        mobileNumber: '1234567890',
        address: 'Test Address',
        paymentMethod: 'bkash',
        shippingMethod: 'standard',
        shippingCost: 0,
        subtotal: 59.99,
        tax: 0,
        totalAmount: 59.99,
        status: 'PENDING',
        orderItems: {
          create: {
            productId: '0c624eeb-11f8-4025-9825-d4618a690ebc',
            quantity: 1,
            price: 59.99
          }
        }
      },
      include: {
        orderItems: true
      }
    })

    console.log('Test order created successfully:', order)

    // Update product stock
    await prisma.ecommerceProduct.update({
      where: { id: '0c624eeb-11f8-4025-9825-d4618a690ebc' },
      data: {
        stockValue: {
          decrement: 1
        }
      }
    })

    console.log('Product stock updated')
  } catch (error) {
    console.error('Error creating test order:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOrder() 