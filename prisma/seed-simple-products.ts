import { PrismaClient, ProductType } from '@prisma/client'

const prisma = new PrismaClient()

const simpleProducts = [
  {
    name: 'Classic Notebook',
    description: 'High-quality notebook with premium paper',
    sku: 'NB-001',
    price: 9.99,
    imageUrl: '/media/products/1.jpg',
    categoryId: 1, // Assuming 1 is the ID for stationery category
    stockQuantity: 100,
    isActive: true,
    productType: ProductType.PHYSICAL
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with long battery life',
    sku: 'MS-001',
    price: 29.99,
    imageUrl: '/media/products/2.jpg',
    categoryId: 2, // Assuming 2 is the ID for electronics category
    stockQuantity: 50,
    isActive: true,
    productType: ProductType.PHYSICAL
  },
  {
    name: 'Coffee Mug',
    description: 'Ceramic coffee mug with heat-resistant handle',
    sku: 'CM-001',
    price: 14.99,
    imageUrl: '/media/products/3.jpg',
    categoryId: 3, // Assuming 3 is the ID for home goods category
    stockQuantity: 75,
    isActive: true,
    productType: ProductType.PHYSICAL
  },
  {
    name: 'Digital PDF Guide',
    description: 'Comprehensive guide to digital marketing',
    sku: 'DG-001',
    price: 49.99,
    imageUrl: '/media/products/4.jpg',
    categoryId: 4, // Assuming 4 is the ID for digital products category
    stockQuantity: 999,
    isActive: true,
    productType: ProductType.DIGITAL,
    downloadUrl: '/downloads/marketing-guide.pdf'
  }
]

async function main() {
  console.log('Starting to seed simple products...')
  
  try {
    for (const product of simpleProducts) {
      const createdProduct = await prisma.product.create({
        data: product
      })
      console.log(`Created product: ${createdProduct.name}`)
    }
    
    console.log('Simple products seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding simple products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 