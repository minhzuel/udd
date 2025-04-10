import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  try {
    const products = await prisma.ecommerceProduct.findMany({
      where: {
        status: 'PUBLISHED',
        isTrashed: false,
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            sku: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        beforeDiscount: true,
        thumbnail: true,
        productImage: {
          select: {
            url: true
          }
        }
      },
      take: 10
    })

    // Split products into two columns
    const column1 = products.slice(0, Math.ceil(products.length / 2))
    const column2 = products.slice(Math.ceil(products.length / 2))

    return NextResponse.json({ column1, column2 })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
} 