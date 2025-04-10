import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Context = {
  params: {
    id: string
  }
}

export async function POST(
  request: NextRequest,
  { params }: Context
): Promise<NextResponse> {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { variations } = body

    // First, delete existing variations for this product
    await prisma.productVariation.deleteMany({
      where: {
        productId: id
      }
    })

    // Create new variations
    const createdVariations = await Promise.all(
      variations.map(async (variation: any) => {
        return prisma.productVariation.create({
          data: {
            productId: id,
            name: variation.name,
            value: variation.value,
            additionalPrice: variation.additionalPrice || 0,
            stock_quantity: variation.stock_quantity || 0,
            cost: variation.cost || 0
          }
        })
      })
    )

    return NextResponse.json(createdVariations)
  } catch (error) {
    console.error('Error creating variations:', error)
    return NextResponse.json(
      { error: 'Failed to create variations' },
      { status: 500 }
    )
  }
} 