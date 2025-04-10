import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database migration and seeding...')
  
  // Create categories
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

  for (let i = 0; i < categories.length; i++) {
    const categoryName = categories[i]
    
    await prisma.category.create({
      data: {
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-') + `-${i+1}`,
        metaTitle: `${categoryName} - Best Deals and Reviews`,
        metaDescription: `Shop the best ${categoryName.toLowerCase()} products at great prices.`
      }
    })
  }
  
  console.log('Categories created')
  
  // Create brands
  const brands = [
    'Apple',
    'Samsung',
    'Sony',
    'Microsoft',
    'Nike'
  ]

  for (const brandName of brands) {
    await prisma.brand.create({
      data: {
        name: brandName
      }
    })
  }
  
  console.log('Brands created')
  
  // Create warranties
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
    }
  ]

  for (const warranty of warranties) {
    await prisma.warranty.create({
      data: warranty
    })
  }
  
  console.log('Warranties created')
  
  // Get created entities
  const createdCategories = await prisma.category.findMany()
  const createdBrands = await prisma.brand.findMany()
  const createdWarranties = await prisma.warranty.findMany()
  
  // Create simple products
  const simpleProducts = []
  
  for (let i = 0; i < 20; i++) {
    const categoryId = createdCategories[i % createdCategories.length].id
    const categoryName = createdCategories[i % createdCategories.length].name
    
    const price = faker.number.int({ min: 999, max: 15000 })
    const hasDiscount = Math.random() > 0.25
    const discountAmount = hasDiscount ? Math.round(price * (faker.number.int({ min: 5, max: 30 }) / 100)) : 0
    const offerPrice = hasDiscount ? price - discountAmount : null
    
    const productName = `${categoryName} Product ${i + 1}`
    const sku = `PROD-${categoryName.substring(0, 3).toUpperCase()}-${i + 1}`.replace(/\s/g, '')
    
    simpleProducts.push({
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
      brandId: createdBrands[i % createdBrands.length].id,
      warrantyId: createdWarranties[i % createdWarranties.length].id,
      productType: 'physical',
      cost: Math.round(price * 0.6),
      metaTitle: `${productName} - Best Price and Quality`,
      metaDescription: `Shop ${productName} at the best price with free shipping and warranty.`,
      slug: productName.toLowerCase().replace(/\s+/g, '-') + `-${i+1}`,
    })
  }
  
  for (const productData of simpleProducts) {
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
        brandId: productData.brandId,
        warrantyId: productData.warrantyId,
        productType: productData.productType,
        cost: productData.cost,
        metaTitle: productData.metaTitle,
        metaDescription: productData.metaDescription,
        slug: productData.slug,
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
    
    console.log(`Created product: ${product.name}`)
  }
  
  console.log('Products created')
  console.log('Database migration and seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 