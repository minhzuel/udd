import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Get all product images from the directory
const getProductImages = () => {
  const productsDir = path.join(process.cwd(), 'public', 'media', 'products')
  return fs.readdirSync(productsDir)
    .filter(file => file.endsWith('.jpg'))
    .map(file => `/media/products/${file}`)
}

// Get a random image from the array
const getRandomImage = (images: string[]) => {
  return images[Math.floor(Math.random() * images.length)]
}

async function updateProductImages() {
  console.log('Starting to update product images...')
  
  try {
    // Get all available product images
    const availableImages = getProductImages()
    console.log(`Found ${availableImages.length} available images`)

    // Get all products
    const products = await prisma.product.findMany()
    console.log(`Found ${products.length} products to update`)

    // Update each product
    for (const product of products) {
      // Update main product image
      const randomImage = getRandomImage(availableImages)
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: randomImage }
      })
      console.log(`Updated image for product: ${product.name}`)
    }

    console.log('Product images update completed successfully!')
  } catch (error) {
    console.error('Error updating product images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductImages() 