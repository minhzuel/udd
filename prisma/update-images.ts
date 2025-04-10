import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating category images...')
  await prisma.ecommerceCategory.updateMany({
    data: {
      image: '/brand/placeholder.png'
    }
  })

  console.log('Updating product images...')
  await prisma.ecommerceProduct.updateMany({
    data: {
      thumbnail: '/brand/placeholder.png'
    }
  })

  console.log('Image update completed!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 