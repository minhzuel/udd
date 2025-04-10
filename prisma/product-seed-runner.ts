import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First, delete all existing products and related data
  console.log('Cleaning up existing data...')
  await prisma.productVariationCombination.deleteMany()
  await prisma.productVariation.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productSpecification.deleteMany()
  await prisma.productQuestion.deleteMany()
  await prisma.productReview.deleteMany()
  await prisma.productTag.deleteMany()
  await prisma.product.deleteMany()
  await prisma.brand.deleteMany()

  // Create a brand
  console.log('Creating brand...')
  const brand = await prisma.brand.create({
    data: {
      name: "Premium Apparel",
      imageUrl: "brand-logo.jpg"
    }
  })

  // Create a sample product with multiple variations
  console.log('Creating sample product with variations...')
  
  // Create a T-shirt product with Color, Size, and Material variations
  const tshirt = await prisma.product.create({
    data: {
      name: "Premium Cotton T-Shirt",
      sku: "TSHIRT-001",
      description: "A comfortable and stylish t-shirt made from premium cotton",
      price: 29.99,
      offerPrice: 24.99,
      offerExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      weight: 0.2,
      length: 0.7,
      width: 0.5,
      height: 0.1,
      categoryId: 2, // Assuming 2 is the ID for Fashion category
      brandId: brand.id,
      productType: "physical",
      cost: 15.00,
      metaTitle: "Premium Cotton T-Shirt - Comfortable & Stylish",
      metaDescription: "Shop our premium cotton t-shirt collection. Available in various colors, sizes, and materials.",
      slug: "premium-cotton-t-shirt",
      images: {
        create: [
          { imageUrl: "tshirt-1.jpg", isMain: true },
          { imageUrl: "tshirt-2.jpg", isMain: false },
          { imageUrl: "tshirt-3.jpg", isMain: false }
        ]
      },
      specifications: {
        create: [
          { name: "Material", value: "100% Cotton" },
          { name: "Care Instructions", value: "Machine wash cold" },
          { name: "Origin", value: "Made in Bangladesh" }
        ]
      }
    }
  })

  // Create variations for Color
  const colorVariations = await Promise.all([
    prisma.productVariation.create({
      data: {
        productId: tshirt.id,
        name: "Color",
        value: "Black",
        additionalPrice: 0,
        stock_quantity: 100
      }
    }),
    prisma.productVariation.create({
      data: {
        productId: tshirt.id,
        name: "Color",
        value: "White",
        additionalPrice: 0,
        stock_quantity: 100
      }
    }),
    prisma.productVariation.create({
      data: {
        productId: tshirt.id,
        name: "Color",
        value: "Navy Blue",
        additionalPrice: 0,
        stock_quantity: 100
      }
    })
  ])

  // Create variations for Size
  const sizeVariations = await Promise.all([
    prisma.productVariation.create({
      data: {
        productId: tshirt.id,
        name: "Size",
        value: "S",
        additionalPrice: 0,
        stock_quantity: 50
      }
    }),
    prisma.productVariation.create({
      data: {
        productId: tshirt.id,
        name: "Size",
        value: "M",
        additionalPrice: 0,
        stock_quantity: 75
      }
    }),
    prisma.productVariation.create({
      data: {
        productId: tshirt.id,
        name: "Size",
        value: "L",
        additionalPrice: 0,
        stock_quantity: 75
      }
    }),
    prisma.productVariation.create({
      data: {
        productId: tshirt.id,
        name: "Size",
        value: "XL",
        additionalPrice: 2.00, // Extra charge for XL
        stock_quantity: 50
      }
    })
  ])

  // Create variations for Material
  const materialVariations = await Promise.all([
    prisma.productVariation.create({
      data: {
        productId: tshirt.id,
        name: "Material",
        value: "Cotton",
        additionalPrice: 0,
        stock_quantity: 200
      }
    }),
    prisma.productVariation.create({
      data: {
        productId: tshirt.id,
        name: "Material",
        value: "Cotton Blend",
        additionalPrice: -2.00, // Slightly cheaper
        stock_quantity: 150
      }
    })
  ])

  // Create combinations of variations
  const combinations = []
  for (const color of colorVariations) {
    for (const size of sizeVariations) {
      for (const material of materialVariations) {
        combinations.push({
          productId: tshirt.id,
          variationId1: color.id,
          variationId2: size.id,
          variationId3: material.id
        })
      }
    }
  }

  // Insert all combinations
  await prisma.productVariationCombination.createMany({
    data: combinations
  })

  console.log('Sample product with variations created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 