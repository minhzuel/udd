import { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function updateOfferPrices() {
  try {
    // Update some products with offer prices
    const products = await prisma.product.findMany({
      take: 5, // Get 5 products to update
      include: {
        variations: true
      }
    })

    for (const product of products) {
      // Set offer price to 20% less than the original price
      const currentPrice = Number(product.price)
      const offerPrice = new Prisma.Decimal(currentPrice * 0.8)
      const offerExpiry = new Date()
      offerExpiry.setDate(offerExpiry.getDate() + 30) // Offer valid for 30 days

      // Update the product
      await prisma.product.update({
        where: { id: product.id },
        data: {
          offerPrice,
          offerExpiry
        }
      })

      // Update variations if they exist
      if (product.variations.length > 0) {
        for (const variation of product.variations) {
          if (variation.price) {
            const variationPrice = Number(variation.price)
            const variationOfferPrice = new Prisma.Decimal(variationPrice * 0.8)
            
            await prisma.productVariation.update({
              where: { id: variation.id },
              data: {
                price: variationOfferPrice
              }
            })
          }
        }
      }

      console.log(`Updated product ${product.id} with offer price`)
    }

    console.log('Successfully updated offer prices')
  } catch (error) {
    console.error('Error updating offer prices:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateOfferPrices() 