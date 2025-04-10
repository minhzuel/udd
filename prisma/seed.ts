import { PrismaClient, Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const productImages = [
  '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
  '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
  '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg',
  '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
  '21.jpg', '22.jpg', '23.jpg', '24.jpg', '25.jpg',
  '26.jpg', '27.jpg', '28.jpg', '29.jpg', '30.jpg',
  '31.jpg', '32.jpg', '33.jpg', '34.jpg', '35.jpg'
]

function generateRandomOfferPrice(basePrice: number): number {
  const discount = Math.random() * 0.3 // Random discount between 0-30%
  return Math.floor(basePrice * (1 - discount))
}

async function seedCategories() {
  console.log('Seeding categories...')
  
  const categories = [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Books',
    'Sports',
    'Beauty',
    'Toys',
    'Food',
    'Health',
    'Automotive'
  ]

  for (const categoryName of categories) {
    await prisma.category.create({
      data: {
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
        metaTitle: `${categoryName} - Best Deals and Reviews`,
        metaDescription: `Shop the best ${categoryName.toLowerCase()} products at great prices.`
      }
    })
  }

  console.log('Categories seeded successfully!')
}

async function seedBrands() {
  console.log('Seeding brands...')
  
  const brands = [
    'Apple',
    'Samsung',
    'Sony',
    'Microsoft',
    'Nike',
    'Adidas',
    'Puma',
    'Under Armour',
    'New Balance',
    'Asics'
  ]

  for (const brandName of brands) {
    await prisma.brand.create({
      data: {
        name: brandName
      }
    })
  }

  console.log('Brands seeded successfully!')
}

async function seedWarranties() {
  console.log('Seeding warranties...')
  
  const warranties = [
    {
      name: 'Standard Warranty',
      duration: 12,
      description: '1 year standard warranty covering manufacturing defects'
    },
    {
      name: 'Extended Warranty',
      duration: 24,
      description: '2 years extended warranty with comprehensive coverage'
    },
    {
      name: 'Premium Warranty',
      duration: 36,
      description: '3 years premium warranty with full coverage and priority support'
    },
    {
      name: 'Basic Warranty',
      duration: 6,
      description: '6 months basic warranty covering essential components'
    },
    {
      name: 'Lifetime Warranty',
      duration: 1200, // 100 years
      description: 'Lifetime warranty with comprehensive coverage and premium support'
    }
  ]

  for (const warranty of warranties) {
    await prisma.warranty.upsert({
      where: { name: warranty.name },
      update: warranty,
      create: warranty
    })
  }

  console.log('Warranties seeded successfully!')
}

async function seedProducts() {
  console.log('Seeding products...')
  
  const categories = await prisma.category.findMany()
  const brands = await prisma.brand.findMany()
  const warranties = await prisma.warranty.findMany()
  
  for (const category of categories) {
    // Generate 30 products for each category
    for (let i = 0; i < 30; i++) {
      const basePrice = Math.floor(Math.random() * 10000) + 1000 // 1000-11000
      const hasOffer = Math.random() > 0.5
      const name = `${category.name} Product ${i + 1}`
      
      await prisma.product.create({
        data: {
          name,
          description: `High-quality ${category.name.toLowerCase()} product with excellent features.`,
          price: new Prisma.Decimal(basePrice),
          offerPrice: hasOffer ? new Prisma.Decimal(generateRandomOfferPrice(basePrice)) : null,
          offerExpiry: hasOffer ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days from now
          weight: new Prisma.Decimal(Math.random() * 10),
          length: new Prisma.Decimal(Math.random() * 100),
          width: new Prisma.Decimal(Math.random() * 100),
          height: new Prisma.Decimal(Math.random() * 100),
          cost: new Prisma.Decimal(basePrice * 0.6), // 40% margin
          metaTitle: `${name} - Best Deals and Reviews`,
          metaDescription: `Shop the best ${name.toLowerCase()} at great prices.`,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          mainImage: `/media/products/${productImages[i % productImages.length]}`,
          sku: `SKU-${Math.random().toString(36).substr(2, 8)}`,
          productType: 'physical',
          category: {
            connect: {
              id: category.id
            }
          },
          brand: {
            connect: {
              id: brands[Math.floor(Math.random() * brands.length)].id
            }
          },
          warranty: {
            connect: {
              id: warranties[Math.floor(Math.random() * warranties.length)].id
            }
          },
          inventory: {
            create: {
              quantity: Math.floor(Math.random() * 100) + 1,
              reorderLevel: 10
            }
          }
        }
      })
    }
  }

  console.log('Products seeded successfully!')
}

async function main() {
  try {
    await seedCategories()
    await seedBrands()
    await seedWarranties()
    await seedProducts()

    // Create variations
    const sizeVariations = await Promise.all([
      prisma.productVariation.create({
        data: { name: 'Size', value: 'Small' }
      }),
      prisma.productVariation.create({
        data: { name: 'Size', value: 'Medium' }
      }),
      prisma.productVariation.create({
        data: { name: 'Size', value: 'Large' }
      })
    ]);

    const colorVariations = await Promise.all([
      prisma.productVariation.create({
        data: { name: 'Color', value: 'Red' }
      }),
      prisma.productVariation.create({
        data: { name: 'Color', value: 'Blue' }
      }),
      prisma.productVariation.create({
        data: { name: 'Color', value: 'Green' }
      })
    ]);

    const materialVariations = await Promise.all([
      prisma.productVariation.create({
        data: { name: 'Material', value: 'Cotton' }
      }),
      prisma.productVariation.create({
        data: { name: 'Material', value: 'Polyester' }
      }),
      prisma.productVariation.create({
        data: { name: 'Material', value: 'Silk' }
      })
    ]);

    // Get all products
    const products = await prisma.product.findMany();

    // Create variation combinations for each product
    for (const product of products) {
      // Create combinations with size and color
      for (const size of sizeVariations) {
        for (const color of colorVariations) {
          await prisma.productVariationCombination.create({
            data: {
              productId: product.id,
              variationId1: size.id,
              variationId2: color.id,
              stockQuantity: faker.number.int({ min: 10, max: 100 }),
              price: Number(product.price) + faker.number.int({ min: 0, max: 10 }),
              cost: Number(product.cost) + faker.number.int({ min: 0, max: 5 })
            }
          });
        }
      }

      // Create combinations with size and material
      for (const size of sizeVariations) {
        for (const material of materialVariations) {
          await prisma.productVariationCombination.create({
            data: {
              productId: product.id,
              variationId1: size.id,
              variationId2: material.id,
              stockQuantity: faker.number.int({ min: 10, max: 100 }),
              price: Number(product.price) + faker.number.int({ min: 0, max: 10 }),
              cost: Number(product.cost) + faker.number.int({ min: 0, max: 5 })
            }
          });
        }
      }

      // Create combinations with color and material
      for (const color of colorVariations) {
        for (const material of materialVariations) {
          await prisma.productVariationCombination.create({
            data: {
              productId: product.id,
              variationId1: color.id,
              variationId2: material.id,
              stockQuantity: faker.number.int({ min: 10, max: 100 }),
              price: Number(product.price) + faker.number.int({ min: 0, max: 10 }),
              cost: Number(product.cost) + faker.number.int({ min: 0, max: 5 })
            }
          });
        }
      }

      // Create combinations with all three variations
      for (const size of sizeVariations) {
        for (const color of colorVariations) {
          for (const material of materialVariations) {
            await prisma.productVariationCombination.create({
              data: {
                productId: product.id,
                variationId1: size.id,
                variationId2: color.id,
                variationId3: material.id,
                stockQuantity: faker.number.int({ min: 10, max: 100 }),
                price: Number(product.price) + faker.number.int({ min: 0, max: 10 }),
                cost: Number(product.cost) + faker.number.int({ min: 0, max: 5 })
              }
            });
          }
        }
      }
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 