'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RiShoppingCartLine, RiHeartLine } from '@remixicon/react'

interface Product {
  id: number
  name: string
  sku: string
  price: number
  offerPrice: number | null
  description: string
  category: {
    id: number
    name: string
    slug: string
  }
  specifications: {
    name: string
    value: string
  }[]
  mainImage: string
  inventory: {
    quantity: number
  } | null
}

export function CurrentDeals() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await fetch('/api/products/deals')
      if (!response.ok) {
        throw new Error('Failed to fetch deals')
      }
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Exclusive Deals</h2>
          <Button variant="ghost" disabled>View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden group">
              <Skeleton className="aspect-square" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!products?.length) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Exclusive Deals</h2>
        <Link href="/deals">
          <Button variant="ghost">View All</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group">
            <Link href={`/product/${product.id}`}>
              <div className="relative aspect-square">
                <Image
                  src={product.mainImage ? (product.mainImage.startsWith('/public') ? product.mainImage.replace('/public', '') : `/media/products/${product.mainImage}`) : '/media/products/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.offerPrice && (
                  <Badge 
                    variant="destructive" 
                    className="absolute top-2 right-2"
                  >
                    Sale
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary">
                    <RiShoppingCartLine className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="secondary">
                    <RiHeartLine className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Link>
            
            <div className="p-4">
              <Link href={`/product/${product.id}`}>
                <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  {product.sku || 'No SKU'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {product.offerPrice ? (
                  <>
                    <span className="text-lg font-semibold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.offerPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-semibold">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 