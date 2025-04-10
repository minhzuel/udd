'use client'

import { CategoriesServer } from './CategoriesServer'
import { HeroSectionClient } from './HeroSectionClient'

export function HeroSection() {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex">
          {/* Categories Menu */}
          <div className="w-[16%] shrink-0">
            <CategoriesServer />
          </div>

          {/* Gap */}
          <div className="w-[2%] shrink-0" />

          {/* Hero Banner */}
          <div className="w-[82%] shrink-0">
            <HeroSectionClient />
          </div>
        </div>
      </div>
    </section>
  )
} 