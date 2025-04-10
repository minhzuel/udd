'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Store {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  _count: {
    ecommerceProduct: number
  }
}

export function StoresTab() {
  const { data: stores, isLoading } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await fetch('/api/stores')
      if (!response.ok) throw new Error('Failed to fetch stores')
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!stores?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No stores found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((store) => (
        <Link 
          key={store.id}
          href={`/store/${store.slug}`}
          className="group block"
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-muted/10">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    {store.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                  {store.name}
                </h3>
                {store.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {store.description}
                  </p>
                )}
                <span className="text-sm text-muted-foreground">
                  {store._count.ecommerceProduct} products
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
} 