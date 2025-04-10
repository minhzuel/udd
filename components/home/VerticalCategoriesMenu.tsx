'use client'

import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string
  _count: {
    ecommerceProduct: number
  }
  children: Category[]
}

interface ErrorResponse {
  error: string
  message?: string
}

export function VerticalCategoriesMenu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()

        if (!response.ok) {
          const errorData = data as ErrorResponse
          throw new Error(errorData.message || errorData.error || 'Failed to fetch categories')
        }

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: Expected an array of categories')
        }

        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError(err instanceof Error ? err.message : 'Failed to load categories')
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <div className="w-64 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="p-2 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-64 rounded-lg border bg-destructive/10 text-destructive shadow-sm">
        <div className="p-4 border-b border-destructive/20">
          <h2 className="font-semibold">Error</h2>
        </div>
        <div className="p-4">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b bg-muted/50">
        <h2 className="font-semibold">Categories</h2>
      </div>
      
      <nav className="p-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => setActiveCategory(category.id)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <Link
              href={`/category/${category.slug}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeCategory === category.id && "bg-accent text-accent-foreground"
              )}
            >
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-sm bg-background">
                <Image
                  src={category.image || "/categories/category.png"}
                  alt={category.name}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{category.name}</div>
                <div className="text-xs text-muted-foreground">
                  {category._count.ecommerceProduct} products
                </div>
              </div>
              {category.children && category.children.length > 0 && (
                <ChevronRight className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  activeCategory === category.id && "rotate-90"
                )} />
              )}
            </Link>

            {/* Subcategories */}
            {category.children && category.children.length > 0 && activeCategory === category.id && (
              <div 
                className={cn(
                  "absolute left-full top-0 ml-1 w-64 bg-card border rounded-lg shadow-lg z-50",
                  "animate-in fade-in-0 slide-in-from-left-1"
                )}
              >
                <div className="p-2 border-b bg-muted/50">
                  <h3 className="font-medium text-sm">{category.name}</h3>
                </div>
                <div className="p-2">
                  {category.children.map((subCategory) => (
                    <Link
                      key={subCategory.id}
                      href={`/category/${subCategory.slug}`}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-sm bg-background">
                        <Image
                          src={subCategory.image || "/categories/category.png"}
                          alt={subCategory.name}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{subCategory.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {subCategory._count.ecommerceProduct} products
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
} 