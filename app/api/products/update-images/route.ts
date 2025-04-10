import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Define product image mapping based on category or product name
const productImageBase = '/images/products/'

// Create an array of product images
const productImages = [
  '/images/products/electronics-1.jpg',
  '/images/products/electronics-2.jpg',
  '/images/products/electronics-3.jpg',
  '/images/products/clothing-1.jpg',
  '/images/products/clothing-2.jpg',
  '/images/products/clothing-3.jpg',
  '/images/products/home-1.jpg',
  '/images/products/home-2.jpg',
  '/images/products/home-3.jpg',
  '/images/products/books-1.jpg',
  '/images/products/books-2.jpg',
  '/images/products/books-3.jpg',
]

// Default image if no specific product image is available
const defaultImage = '/images/products/default.jpg'

export async function POST() {
  try {
    // First check if we can connect to the database
    await prisma.$connect()
    console.log('Database connected successfully')

    // Get all products
    const products = await prisma.ecommerceProduct.findMany({
      where: {
        isTrashed: false
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    console.log(`Found ${products.length} products to update`)

    // Update product images based on their category
    const updates = await Promise.all(
      products.map(async (product, index) => {
        let imageUrl = defaultImage
        
        // Assign images based on category
        if (product.category) {
          const categoryName = product.category.name.toLowerCase()
          
          if (categoryName.includes('electronics')) {
            imageUrl = productImages[index % 3]; // Use one of the electronics images
          } else if (categoryName.includes('clothing')) {
            imageUrl = productImages[3 + (index % 3)]; // Use one of the clothing images
          } else if (categoryName.includes('home') || categoryName.includes('kitchen')) {
            imageUrl = productImages[6 + (index % 3)]; // Use one of the home images
          } else if (categoryName.includes('books')) {
            imageUrl = productImages[9 + (index % 3)]; // Use one of the books images
          } else {
            // Use a random image if category doesn't match
            imageUrl = productImages[index % productImages.length];
          }
        } else {
          // If no category, use a random image
          imageUrl = productImages[index % productImages.length];
        }
        
        // Update the product with the selected image
        return prisma.ecommerceProduct.update({
          where: { id: product.id },
          data: { thumbnail: imageUrl }
        })
      })
    )

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} products with custom images`,
      count: updates.length,
      details: updates.map(p => ({ id: p.id, name: p.name, thumbnail: p.thumbnail }))
    })
  } catch (error) {
    console.error('Error updating product images:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update product images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 