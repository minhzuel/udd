import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateProductOptionsStock() {
  try {
    // Get all product options
    const options = await prisma.productOption.findMany()
    
    console.log(`Found ${options.length} product options to update`)

    // Update each option with a random stock value
    for (const option of options) {
      await prisma.productOption.update({
        where: { id: option.id },
        data: {
          stockValue: Math.floor(Math.random() * 50) + 10
        }
      })
    }

    console.log('Successfully updated all product options with stock values')
  } catch (error) {
    console.error('Error updating product options:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductOptionsStock() 