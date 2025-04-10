'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RiArrowRightSLine } from '@remixicon/react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image?: string
  children: Category[]
}

export function CategoryMenu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="w-64 bg-background border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <h2 className="font-semibold">Categories</h2>
      </div>
      <nav className="p-2">
        {categories.map((category) => (
          <div key={category.id} className="relative group">
            <Link
              href={`/category/${category.slug}`}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm"
              onMouseEnter={() => setActiveCategory(category.id)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center">
                  <img 
                    src={category.image || "/categories/category.png"} 
                    alt={category.name}
                    className="max-w-full max-h-full object-contain"
                    width={20}
                    height={20}
                  />
                </div>
                <span>{category.name}</span>
              </div>
              {category.children.length > 0 && (
                <RiArrowRightSLine className="h-4 w-4 text-muted-foreground" />
              )}
            </Link>
            {category.children.length > 0 && activeCategory === category.id && (
              <div className="absolute left-full top-0 ml-2 w-64 bg-background border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b bg-muted/50">
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                <div className="p-2">
                  {category.children.map((subCategory) => (
                    <Link
                      key={subCategory.id}
                      href={`/category/${subCategory.slug}`}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-sm"
                    >
                      <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center">
                        <img 
                          src={subCategory.image || "/categories/category.png"} 
                          alt={subCategory.name}
                          className="max-w-full max-h-full object-contain"
                          width={18}
                          height={18}
                        />
                      </div>
                      {subCategory.name}
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