import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(): Promise<NextResponse> {
  try {
    const products = await prisma.product.findMany({
      where: {
        offerPrice: {
          not: null
        },
        offerExpiry: {
          gt: new Date()
        }
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        inventory: true,
        specifications: true
      },
      take: 10
    })

    // Format the response
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      offerPrice: Number(product.offerPrice),
      discountPercentage: Math.round(((Number(product.price) - Number(product.offerPrice)) / Number(product.price)) * 100),
      offerExpiry: product.offerExpiry,
      mainImage: product.mainImage ? (product.mainImage.startsWith('/public') ? product.mainImage : `/public/media/products/${product.mainImage}`) : '/public/media/products/placeholder.png',
      stockQuantity: product.inventory?.[0]?.quantity || 0,
      specifications: product.specifications,
      category: {
        name: product.category.name,
        slug: product.category.slug
      }
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
} 