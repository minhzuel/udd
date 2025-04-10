import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, stockQuantity, categoryId, imageUrl, sku, productType, variations } = body

    // Convert price to Decimal
    const decimalPrice = new Prisma.Decimal(price)

    // Create the product with variations as JSON
    const product = await prisma.products.create({
      data: {
        name,
        description,
        price: decimalPrice,
        stockQuantity,
        category_id: categoryId,
        main_image: imageUrl,
        sku,
        product_type: productType,
        variations: variations ? JSON.stringify(variations) : "[]"
      },
      include: {
        categories: true
      }
    })

    // Transform the response
    const transformedProduct = {
      ...product,
      price: Number(product.price),
      offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
      variations: product.variations ? JSON.parse(product.variations as string) : []
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '12')

    const products = await prisma.products.findMany({
      skip,
      take,
      include: {
        categories: true,
        product_specifications: true
      },
      orderBy: {
        product_id: 'desc'
      }
    })

    // Transform the response to include both camelCase and snake_case field names for frontend compatibility
    const transformedProducts = products.map(product => ({
      ...product,
      // Include both formats for consistent rendering
      id: product.product_id,
      product_id: product.product_id,
      price: Number(product.price),
      offerPrice: product.offer_price ? Number(product.offer_price) : null,
      offer_price: product.offer_price ? Number(product.offer_price) : null,
      mainImage: product.main_image,
      main_image: product.main_image,
      categoryId: product.category_id,
      category_id: product.category_id,
      variations: product.variations ? JSON.parse(product.variations as string) : []
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
} 