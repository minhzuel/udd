import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting cleanup of duplicate variations...')

  // Get all products with their variations
  const products = await prisma.product.findMany({
    include: {
      variations: {
        include: {
          attributes: {
            include: {
              attribute: true
            }
          }
        }
      }
    }
  })

  console.log(`Found ${products.length} products to process`)

  let cleanedCount = 0

  for (const product of products) {
    // Create a map to track unique variation combinations
    const variationMap = new Map()

    // First pass: identify duplicates
    for (const variation of product.variations) {
      const name = variation.attributes[0]?.attribute.name || 'Unknown'
      const value = variation.attributes[0]?.value || 'Unknown'
      const key = `${name}-${value}`
      
      if (variationMap.has(key)) {
        // Keep the variation with the lower ID (older one)
        const existingId = variationMap.get(key)
        const variationToDelete = variation.id > existingId ? variation.id : existingId
        
        try {
          // Delete the duplicate variation
          await prisma.variationAttribute.deleteMany({
            where: {
              variationId: variationToDelete
            }
          })
          
          await prisma.productVariation.delete({
            where: {
              id: variationToDelete
            }
          })
          
          cleanedCount++
          console.log(`Cleaned up duplicate variation in product "${product.name}" (ID: ${product.id}):`)
          console.log(`- Name: ${name}`)
          console.log(`- Value: ${value}`)
          console.log(`- Deleted Variation ID: ${variationToDelete}`)
        } catch (error) {
          console.error(`Error cleaning up variation ${variationToDelete}:`, error)
        }
      } else {
        variationMap.set(key, variation.id)
      }
    }
  }

  console.log(`\nCleanup completed!`)
  console.log(`Removed ${cleanedCount} duplicate variations`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 