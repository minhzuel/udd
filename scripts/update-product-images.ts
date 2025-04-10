import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting product image update...')

  // Get all images from the products directory
  const productsDir = path.join(process.cwd(), 'public', 'media', 'products')
  const imageFiles = fs.readdirSync(productsDir)
    .filter(file => file.endsWith('.jpg'))
    .map(file => `/media/products/${file}`)

  console.log(`Found ${imageFiles.length} image files to use`)

  if (imageFiles.length === 0) {
    console.error('No image files found in', productsDir)
    return
  }

  // Get random image from the array
  const getRandomImage = (): string => {
    const randomIndex = Math.floor(Math.random() * imageFiles.length)
    return imageFiles[randomIndex]
  }

  // 1. Update main_image for all products
  const products = await prisma.product.findMany()
  console.log(`Updating ${products.length} products...`)

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        mainImage: getRandomImage()
      }
    })
  }
  console.log('✅ Updated main_image for all products')

  // 2. Update product_images table
  const productImages = await prisma.productImage.findMany()
  console.log(`Updating ${productImages.length} product images...`)

  for (const image of productImages) {
    await prisma.productImage.update({
      where: { id: image.id },
      data: {
        imageUrl: getRandomImage()
      }
    })
  }
  console.log('✅ Updated all product images')

  // 3. Update variation combinations
  const variations = await prisma.productVariationCombination.findMany()
  console.log(`Updating ${variations.length} product variation combinations...`)

  for (const variation of variations) {
    await prisma.productVariationCombination.update({
      where: { id: variation.id },
      data: {
        imageUrl: getRandomImage()
      }
    })
  }
  console.log('✅ Updated all variation combinations')

  console.log('Product image update completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error updating product images:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 