'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  _count: {
    ecommerceProduct: number
  }
}

export function BrandsTab() {
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await fetch('/api/brands')
      if (!response.ok) throw new Error('Failed to fetch brands')
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </Card>
        ))}
      </div>
    )
  }

  if (!brands?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No brands found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {brands.map((brand) => (
        <Link 
          key={brand.id}
          href={`/brand/${brand.slug}`}
          className="group block"
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="aspect-square relative mb-2">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/10 text-muted-foreground">
                  {brand.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {brand.name}
              </h3>
              <span className="text-sm text-muted-foreground">
                {brand._count.ecommerceProduct} products
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
} 