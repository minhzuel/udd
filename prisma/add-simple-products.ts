import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Define product categories
const categories = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // All category IDs
const productTypes = ['physical']

// Function to generate a random price
const generatePrice = () => faker.number.int({ min: 999, max: 15000 })

// Function to generate random offer price (75% of products will have offer price)
const generateOfferPrice = (price: number) => {
  if (Math.random() > 0.25) {
    const discountPercentage = faker.number.int({ min: 5, max: 30 }) / 100
    return Math.round(price * (1 - discountPercentage))
  }
  return null
}

// Define simple products (no variations)
const simpleProducts = Array.from({ length: 20 }).map((_, index) => {
  const categoryId = faker.helpers.arrayElement(categories)
  const categoryNames = [
    'Electronics', 'Fashion', 'Home & Living', 'Books', 
    'Sports', 'Beauty', 'Toys', 'Food', 'Health', 'Automotive'
  ]
  const categoryName = categoryNames[categoryId - 1]
  
  const price = generatePrice()
  const offerPrice = generateOfferPrice(price)
  
  const productName = `Simple ${categoryName} Item ${index + 1}`
  const sku = `SIMPLE-${categoryName.substring(0, 3).toUpperCase()}-${index + 1}`.replace(/\s/g, '')
  
  return {
    name: productName,
    sku,
    description: faker.commerce.productDescription(),
    price,
    offerPrice,
    offerExpiry: offerPrice ? faker.date.future() : null,
    weight: faker.number.float({ min: 0.1, max: 10, precision: 0.01 }),
    length: faker.number.float({ min: 5, max: 100, precision: 0.01 }),
    width: faker.number.float({ min: 5, max: 100, precision: 0.01 }),
    height: faker.number.float({ min: 1, max: 50, precision: 0.01 }),
    categoryId,
    productType: faker.helpers.arrayElement(productTypes),
    cost: Math.round(price * 0.6),
    metaTitle: `${productName} - Best Price and Quality`,
    metaDescription: `Shop ${productName} at the best price with free shipping and warranty.`,
    slug: productName.toLowerCase().replace(/\s+/g, '-'),
    warrantyId: faker.number.int({ min: 1, max: 3 }),
  }
})

async function main() {
  console.log('Starting to seed simple products...')
  
  try {
    for (const productData of simpleProducts) {
      // Check if product with same SKU exists
      const existing = await prisma.product.findUnique({
        where: { sku: productData.sku }
      })
      
      if (existing) {
        console.log(`Product with SKU ${productData.sku} already exists, skipping...`)
        continue
      }
      
      // Create the product
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          sku: productData.sku,
          description: productData.description,
          price: productData.price,
          offerPrice: productData.offerPrice,
          offerExpiry: productData.offerExpiry,
          weight: productData.weight,
          length: productData.length,
          width: productData.width,
          height: productData.height,
          categoryId: productData.categoryId,
          productType: productData.productType,
          cost: productData.cost,
          metaTitle: productData.metaTitle,
          metaDescription: productData.metaDescription,
          slug: productData.slug,
          warrantyId: productData.warrantyId,
        }
      })
      
      // Create product image
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: `https://picsum.photos/seed/${productData.sku}/800/800`,
          isMain: true
        }
      })
      
      // Create product specifications
      await prisma.productSpecification.createMany({
        data: [
          {
            productId: product.id,
            name: "Material",
            value: faker.helpers.arrayElement(["Metal", "Plastic", "Wood", "Fabric", "Ceramic"])
          },
          {
            productId: product.id,
            name: "Brand",
            value: faker.company.name()
          },
          {
            productId: product.id,
            name: "Origin",
            value: faker.location.country()
          }
        ]
      })
      
      // Create inventory entry
      await prisma.inventory.create({
        data: {
          product: {
            connect: {
              id: product.id
            }
          },
          quantity: faker.number.int({ min: 10, max: 100 }),
          reorderLevel: faker.number.int({ min: 5, max: 20 })
        }
      })
      
      console.log(`Created simple product: ${product.name}`)
    }
    
    console.log('Simple products seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding simple products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 