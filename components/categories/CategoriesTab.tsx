'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { RiArrowRightSLine } from '@remixicon/react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  children: Category[]
  _count: {
    ecommerceProduct: number
  }
}

export function CategoriesTab() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      console.log('Fetched categories:', data)
      return data
    }
  })

  const [activeTab, setActiveTab] = useState('all')

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    )
  }

  if (!categories?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories found
      </div>
    )
  }

  // Calculate total products including children
  const getTotalProducts = (category: Category): number => {
    let total = category._count.ecommerceProduct
    if (category.children) {
      category.children.forEach(child => {
        total += getTotalProducts(child)
      })
    }
    return total
  }

  // Get all categories including subcategories
  const getAllCategories = (categories: Category[]): Category[] => {
    return categories.reduce((acc, category) => {
      acc.push(category)
      if (category.children) {
        acc.push(...getAllCategories(category.children))
      }
      return acc
    }, [] as Category[])
  }

  const allCategories = getAllCategories(categories)
  console.log('All categories:', allCategories)

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <span className="text-sm text-muted-foreground">
          {allCategories.length} categories
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCategories.map((category) => (
          <Card key={category.id} className="p-4">
            <Link 
              href={`/category/${category.slug}`}
              className="group block"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium group-hover:text-primary transition-colors">
                    {category.name}
                  </h4>
                  {category.children.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.children.length} subcategories
                    </p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {getTotalProducts(category)} products
                </span>
              </div>
              
              {category.children.length > 0 && (
                <div className="space-y-1 mt-2">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <RiArrowRightSLine className="h-4 w-4 mr-1" />
                      {child.name}
                      <span className="ml-auto text-xs">
                        ({getTotalProducts(child)})
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
} 