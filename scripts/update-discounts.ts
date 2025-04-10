import prisma from '../lib/prisma'

async function main() {
  console.log('Fetching all products...')
  
  // Get all published products
  const products = await prisma.ecommerceProduct.findMany({
    where: {
      status: 'PUBLISHED',
      isTrashed: false
    }
  })

  console.log(`Found ${products.length} products to update`)

  // Update each product with a 20% discount
  for (const product of products) {
    const beforeDiscount = product.price
    const salePrice = product.price * 0.8 // 20% discount

    await prisma.ecommerceProduct.update({
      where: { id: product.id },
      data: {
        price: salePrice,
        beforeDiscount: beforeDiscount
      }
    })

    console.log(`Updated ${product.name}: ${beforeDiscount} -> ${salePrice}`)
  }

  console.log('All products updated successfully!')
}

main()
  .catch((e) => {
    console.error('Error updating products:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 