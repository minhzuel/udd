import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to add product variations...')

  // Get all products
  const products = await prisma.ecommerceProduct.findMany({
    where: {
      isTrashed: false,
    },
    include: {
      variations: true,
    },
  })

  console.log(`Found ${products.length} products to update`)

  // Sample variation data
  const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange']
  const sizes = ['S', 'M', 'L', 'XL', 'XXL']
  const packages = ['Standard', 'Premium', 'Gift Wrapped', 'Bulk']

  // Add variations to each product
  for (const product of products) {
    console.log(`Checking product: ${product.name} (ID: ${product.id})`)
    
    // Skip products that already have variations
    if (product.variations && product.variations.length > 0) {
      console.log(`  Skipping - product already has ${product.variations.length} variations`)
      continue
    }

    console.log(`  Adding variations to product: ${product.name}`)

    // Determine variation types based on product ID to ensure variety
    const lastChar = product.id.charAt(product.id.length - 1)
    const numValue = parseInt(lastChar, 16) || 0 // Convert to number, default to 0

    const variationTypes = []
    if (numValue % 3 === 0) {
      variationTypes.push('Color', 'Size')
    } else if (numValue % 3 === 1) {
      variationTypes.push('Color', 'Package')
    } else {
      variationTypes.push('Size', 'Package')
    }

    // Add 3 random colors if the product has color variations
    if (variationTypes.includes('Color')) {
      const productColors = getRandomElements(colors, 3)
      for (const color of productColors) {
        try {
          await prisma.productVariation.create({
            data: {
              productId: product.id,
              name: 'Color',
              value: color,
              stockValue: Math.floor(Math.random() * 20) + 5,
              // No price adjustment for colors
            },
          })
          console.log(`    Added Color: ${color}`)
        } catch (error) {
          console.log(`    Failed to add Color: ${color}`)
          if (error.code !== 'P2002') throw error // Re-throw if not a unique constraint error
        }
      }
    }

    // Add size variations if the product has size variations
    if (variationTypes.includes('Size')) {
      const productSizes = getRandomElements(sizes, 4)
      for (const size of productSizes) {
        // Adjust price based on size (larger sizes cost more)
        const priceAdjustment = (sizes.indexOf(size) + 1) * 2
        try {
          await prisma.productVariation.create({
            data: {
              productId: product.id,
              name: 'Size',
              value: size,
              stockValue: Math.floor(Math.random() * 15) + 3,
              price: size === 'S' ? null : Number(product.price) + priceAdjustment,
            },
          })
          console.log(`    Added Size: ${size}`)
        } catch (error) {
          console.log(`    Failed to add Size: ${size}`)
          if (error.code !== 'P2002') throw error
        }
      }
    }

    // Add package variations if the product has package variations
    if (variationTypes.includes('Package')) {
      const productPackages = getRandomElements(packages, 2)
      for (const [index, pkg] of productPackages.entries()) {
        // Premium packages cost more
        const priceAdjustment = index * 5
        try {
          await prisma.productVariation.create({
            data: {
              productId: product.id,
              name: 'Package',
              value: pkg,
              stockValue: Math.floor(Math.random() * 10) + 2,
              price: pkg === 'Standard' ? null : Number(product.price) + priceAdjustment,
            },
          })
          console.log(`    Added Package: ${pkg}`)
        } catch (error) {
          console.log(`    Failed to add Package: ${pkg}`)
          if (error.code !== 'P2002') throw error
        }
      }
    }
  }

  console.log('Finished adding product variations')
}

// Helper function to get random elements from an array
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = array.slice().sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 