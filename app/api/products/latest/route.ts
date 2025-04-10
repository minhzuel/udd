import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      include: {
        categories: true,
        ProductToVariation: {
          include: {
            product_variations: true
          }
        },
        product_images: true,
        product_specifications: true
      },
      orderBy: {
        product_id: "desc"
      },
      take: 8
    })

    // Convert Decimal values to numbers and transform to expected format
    const serializedProducts = products.map(product => ({
      id: product.product_id,
      name: product.name,
      description: product.description,
      price: Number(product.price || 0),
      offerPrice: product.offer_price ? Number(product.offer_price) : null,
      offerExpiry: product.offer_expiry,
      sku: product.sku,
      mainImage: product.main_image,
      categoryId: product.category_id,
      // Transform category data
      category: product.categories ? {
        id: product.categories.category_id,
        name: product.categories.category_name,
        slug: product.categories.slug,
        parentCategory: null // Add parent category if needed
      } : null,
      // Convert ProductToVariation to variations for backward compatibility
      variations: product.ProductToVariation.map(ptv => ({
        id: Number(ptv.product_variations.variation_id),
        name: ptv.product_variations.name,
        value: ptv.product_variations.value,
        price: 0 // Default price since variations don't have price in the schema
      })),
      // Add images
      images: product.product_images.map(img => ({
        id: img.image_id,
        url: img.image_url
      })),
      // Add specifications
      specifications: product.product_specifications.map(spec => ({
        name: spec.name,
        value: spec.value
      }))
    }))

    return NextResponse.json(serializedProducts)
  } catch (error) {
    console.error('Error fetching latest products:', error)
    return NextResponse.json({ error: 'Failed to fetch latest products' }, { status: 500 })
  }
} 