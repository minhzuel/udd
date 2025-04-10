import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking for duplicate variations...')

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

  console.log(`Found ${products.length} products to check`)

  let duplicateCount = 0

  for (const product of products) {
    // Create a map to track unique variation combinations
    const variationMap = new Map()

    for (const variation of product.variations) {
      // Get the variation name and value from attributes
      const name = variation.attributes[0]?.attribute.name || 'Unknown'
      const value = variation.attributes[0]?.value || 'Unknown'
      
      // Create a unique key for this variation combination
      const key = `${name}-${value}`
      
      if (variationMap.has(key)) {
        duplicateCount++
        console.log(`\nDuplicate variation found in product "${product.name}" (ID: ${product.id}):`)
        console.log(`- Name: ${name}`)
        console.log(`- Value: ${value}`)
        console.log(`- Variation IDs: ${variationMap.get(key)}, ${variation.id}`)
      } else {
        variationMap.set(key, variation.id)
      }
    }
  }

  if (duplicateCount === 0) {
    console.log('\nNo duplicate variations found!')
  } else {
    console.log(`\nFound ${duplicateCount} duplicate variations`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 