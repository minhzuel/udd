import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Use a single image for all categories
const categoryImage = '/categories/category.png'

export async function POST() {
  try {
    // First check if we can connect to the database
    await prisma.$connect()
    console.log('Database connected successfully')

    // Get all categories
    const categories = await prisma.ecommerceCategory.findMany({
      where: {
        isTrashed: false
      },
      select: {
        id: true,
        slug: true,
        name: true,
      }
    })

    console.log(`Found ${categories.length} categories to update`)

    // Update all categories with the same image
    const updates = await Promise.all(
      categories.map(async (category) => {
        // Update the category with the selected image
        return prisma.ecommerceCategory.update({
          where: { id: category.id },
          data: { image: categoryImage }
        })
      })
    )

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} categories with the same image`,
      count: updates.length,
      details: updates.map(c => ({ id: c.id, name: c.name, image: c.image }))
    })
  } catch (error) {
    console.error('Error updating category images:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update category images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 