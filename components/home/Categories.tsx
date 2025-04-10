'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RiArrowRightSLine } from '@remixicon/react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  children: {
    id: string
    name: string
    slug: string
    description: string | null
  }[]
}

interface CategoriesClientProps {
  categories: Category[]
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.id || '')

  return (
    <>
      {/* Vertical Menu */}
      <Card className="p-2">
        <div className="space-y-1">
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent"
            >
              <span>{category.name}</span>
              {category.children.length > 0 && (
                <RiArrowRightSLine className="h-4 w-4 text-muted-foreground" />
              )}
            </Link>
          ))}
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="mt-8">
        <div className="mb-6 border-b">
          <div className="flex gap-4 -mb-px">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className={`pb-4 px-1 relative ${
                  activeTab === category.id
                    ? 'text-primary font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-primary'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setActiveTab(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {categories.map((category) => (
          <div
            key={category.id}
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
              activeTab === category.id ? 'block' : 'hidden'
            }`}
          >
            {category.children.map((subCategory) => (
              <Link
                key={subCategory.id}
                href={`/category/${category.slug}/${subCategory.slug}`}
                className="p-4 rounded-lg border hover:bg-accent/5 transition-colors"
              >
                <h3 className="font-medium mb-1">{subCategory.name}</h3>
                {subCategory.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {subCategory.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </>
  )
} 