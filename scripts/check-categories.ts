import prisma from '../lib/prisma'

async function main() {
  const categories = await prisma.ecommerceCategory.findMany({
    where: {
      status: 'ACTIVE',
      isTrashed: false
    },
    include: {
      _count: {
        select: {
          ecommerceProduct: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  console.log('\nCategories and their product counts:')
  console.log('===================================')
  categories.forEach(category => {
    console.log(`${category.name}: ${category._count.ecommerceProduct} products`)
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 