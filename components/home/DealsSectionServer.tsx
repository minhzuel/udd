import { prisma } from '@/lib/prisma'
import { DealsSection } from './DealsSection'

export async function DealsSectionServer() {
  const deals = await prisma.ecommerceProduct.findMany({
    where: {
      status: 'PUBLISHED',
      isTrashed: false,
      beforeDiscount: {
        not: null
      }
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
      },
      variations: {
        select: {
          id: true,
          name: true,
          value: true,
          price: true,
          stockValue: true,
          sku: true
        }
      },
      stockValue: true
    },
    take: 7
  })

  // Serialize the data to convert Decimal values to numbers
  const serializedDeals = deals.map(deal => ({
    ...deal,
    price: Number(deal.price),
    beforeDiscount: deal.beforeDiscount ? Number(deal.beforeDiscount) : null,
    variations: deal.variations.map(variation => ({
      ...variation,
      price: variation.price ? Number(variation.price) : null
    }))
  }))

  return <DealsSection deals={serializedDeals} />
} 