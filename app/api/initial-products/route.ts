import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      take: 12,
      include: {
        categories: true,
        product_specifications: true,
        product_images: true,
        ProductToVariation: {
          include: {
            product_variations: true
          }
        }
      },
      orderBy: {
        product_id: 'desc'
      }
    })

    const serializedProducts = products.map(product => ({
      id: product.product_id,
      name: product.name,
      description: product.description,
      price: Number(product.price || 0),
      offerPrice: product.offer_price ? Number(product.offer_price) : null,
      offerExpiry: product.offer_expiry,
      sku: product.sku,
      mainImage: product.main_image,
      category: product.categories ? {
        id: product.categories.category_id,
        name: product.categories.category_name,
        slug: product.categories.slug,
        parentCategory: null // Add parent category logic if needed
      } : null,
      images: product.product_images.map(img => ({
        id: img.image_id,
        url: img.image_url,
        productId: img.product_id,
        isMain: img.is_main
      })),
      specifications: product.product_specifications.map(spec => ({
        name: spec.name,
        value: spec.value,
        id: spec.specification_id,
        productId: spec.product_id
      })),
      // Convert ProductToVariation to variations for backward compatibility
      variations: product.ProductToVariation.map(ptv => ({
        id: Number(ptv.product_variations.variation_id),
        name: ptv.product_variations.name,
        value: ptv.product_variations.value,
        price: 0, // Default to 0 since variation doesn't have price in schema
        offerPrice: null
      }))
    }))

    return NextResponse.json(serializedProducts)
  } catch (error) {
    console.error('Error fetching initial products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch initial products' },
      { status: 500 }
    )
  }
} 