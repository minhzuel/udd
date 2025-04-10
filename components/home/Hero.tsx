'use client'

import { VerticalCategoriesMenu } from './VerticalCategoriesMenu'
import { Search } from 'lucide-react'

export function Hero() {
  return (
    <div className="relative bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Categories Menu */}
          <div className="lg:w-64">
            <VerticalCategoriesMenu />
          </div>

          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-3 pl-12 rounded-lg border bg-card text-card-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 