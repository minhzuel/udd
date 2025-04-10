'use client'

import { useState } from 'react'
import { Menu, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  parentCategoryId: number | null
  childCategories: Category[]
}

interface CategoriesClientProps {
  initialCategories: Category[]
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories] = useState<Category[]>(initialCategories)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  const toggleCategory = (categoryId: number, event: React.MouseEvent) => {
    event.preventDefault()
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const renderCategory = (category: Category) => {
    const hasChildren = category.childCategories?.length > 0
    const isExpanded = expandedCategories.has(category.id)

    return (
      <div key={category.id} className="relative group">
        <Link
          href={`/category/${category.slug}`}
          className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            {category.image ? (
              <Image
                src={category.image.startsWith('/') ? category.image : `/categories/${category.image}`}
                alt={category.name}
                width={24}
                height={24}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <Image
                src="/categories/category.png"
                alt={category.name}
                width={24}
                height={24}
                className="rounded-full object-cover flex-shrink-0"
              />
            )}
            <span className="text-sm font-medium truncate">{category.name}</span>
          </div>
          {hasChildren && (
            <button
              onClick={(e) => toggleCategory(category.id, e)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </Link>
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {category.childCategories.map(child => renderCategory(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Menu className="w-4 h-4" />
          Categories
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.map(category => renderCategory(category))}
      </div>
    </div>
  )
} 