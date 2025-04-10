import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get the second product with its variations
  const product = await prisma.ecommerceProduct.findFirst({
    where: {
      isTrashed: false,
      name: { contains: "Product 2" }
    },
    include: {
      variations: true,
    },
  })

  if (!product) {
    console.log('No products found')
    return
  }

  console.log(`Product: ${product.name} (ID: ${product.id})`)
  console.log(`Found ${product.variations.length} variations:`)
  
  // Group variations by name
  const groupedVariations = product.variations.reduce((acc, variation) => {
    if (!acc[variation.name]) {
      acc[variation.name] = []
    }
    acc[variation.name].push(variation)
    return acc
  }, {})

  // Display variations by type
  for (const [name, variations] of Object.entries(groupedVariations)) {
    console.log(`\n${name} variations:`)
    for (const variation of variations) {
      console.log(`  - ${variation.value}${variation.price ? ` (Price: $${variation.price})` : ''} (Stock: ${variation.stockValue})`)
    }
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