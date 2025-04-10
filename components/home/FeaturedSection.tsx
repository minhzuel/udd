'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'
import {
  RiComputerLine,
  RiTShirtLine,
  RiHome3Line,
  RiBikeLine,
  RiSparklingLine,
  RiGamepadLine,
  RiBookOpenLine,
  RiCarLine,
  RiAppleFill,
  RiSmartphoneLine,
  RiShoppingBag3Line,
  RiHeadphoneLine,
  RiTvLine,
  RiComputerFill,
  RiKeyboardLine,
  RiStore3Line,
  RiStarFill,
  RiShieldCheckLine
} from '@remixicon/react'

// Map category slugs to icons
const categoryIcons: { [key: string]: JSX.Element } = {
  'electronics': <RiComputerLine className="h-12 w-12" />,
  'fashion': <RiTShirtLine className="h-12 w-12" />,
  'home-living': <RiHome3Line className="h-12 w-12" />,
  'sports-outdoors': <RiBikeLine className="h-12 w-12" />,
}

interface Category {
  category_id: number
  category_name: string
  slug: string
  description: string | null
  image_url: string | null
  meta_title: string | null
  meta_description: string | null
  child_categories?: Category[]
}

const featuredData = {
  brands: [
    { id: 1, name: 'Apple', icon: <RiAppleFill className="h-12 w-12" />, products: '235 products' },
    { id: 2, name: 'Samsung', icon: <RiSmartphoneLine className="h-12 w-12" />, products: '189 products' },
    { id: 3, name: 'Nike', icon: <RiShoppingBag3Line className="h-12 w-12" />, products: '312 products' },
    { id: 4, name: 'Sony', icon: <RiHeadphoneLine className="h-12 w-12" />, products: '156 products' },
    { id: 5, name: 'LG', icon: <RiTvLine className="h-12 w-12" />, products: '143 products' },
    { id: 6, name: 'Dell', icon: <RiComputerFill className="h-12 w-12" />, products: '167 products' },
    { id: 7, name: 'HP', icon: <RiKeyboardLine className="h-12 w-12" />, products: '198 products' },
    { id: 8, name: 'Lenovo', icon: <RiComputerLine className="h-12 w-12" />, products: '145 products' },
  ],
  stores: [
    { id: 1, name: 'UDDOG Electronics', icon: <RiStore3Line className="h-12 w-12" />, rating: '4.8' },
    { id: 2, name: 'UDDOG Fashion', icon: <RiShoppingBag3Line className="h-12 w-12" />, rating: '4.6' },
    { id: 3, name: 'UDDOG Home', icon: <RiHome3Line className="h-12 w-12" />, rating: '4.7' },
    { id: 4, name: 'UDDOG Sports', icon: <RiBikeLine className="h-12 w-12" />, rating: '4.5' },
    { id: 5, name: 'UDDOG Beauty', icon: <RiSparklingLine className="h-12 w-12" />, rating: '4.9' },
    { id: 6, name: 'UDDOG Kids', icon: <RiGamepadLine className="h-12 w-12" />, rating: '4.4' },
    { id: 7, name: 'UDDOG Books', icon: <RiBookOpenLine className="h-12 w-12" />, rating: '4.7' },
    { id: 8, name: 'UDDOG Premium', icon: <RiShieldCheckLine className="h-12 w-12" />, rating: '4.6' },
  ],
}

export default function FeaturedSection() {
  const [mounted, setMounted] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 1280px)': { slidesToScroll: 9 },
      '(min-width: 1024px)': { slidesToScroll: 6 },
      '(min-width: 768px)': { slidesToScroll: 4 },
      '(max-width: 767px)': { slidesToScroll: 3 },
    }
  })
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          setCategories(data)
        } else {
          setCategories([])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch categories')
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      fetchCategories()
    }
  }, [mounted])

  // Show loading state on server and initial client render
  if (!mounted || isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg"></div>
                <div className="mt-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  // Get all categories since we're using a carousel
  const displayedCategories = categories

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Categories</h2>
          <Link 
            href="/categories" 
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all categories
            <RiArrowRightSLine className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-2">
              {displayedCategories.map((category) => (
                <div key={category.category_id} className="flex-[0_0_calc(33.333%-4px)] md:flex-[0_0_calc(25%-6px)] lg:flex-[0_0_calc(16.666%-7.33px)] xl:flex-[0_0_calc(11.111%-8px)]">
                  <Link
                    href={`/category/${category.slug}`}
                    className="group relative overflow-hidden rounded-lg bg-card border flex flex-col"
                  >
                    <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden">
                      <Image
                        src={category.image_url || "/categories/category.png"}
                        alt={category.category_name}
                        width={120}
                        height={90}
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="h-px bg-border" />
                    <div className="p-2 flex items-center justify-between bg-card min-h-[48px]">
                      <span className="text-xs font-medium truncate max-w-[70%]">{category.category_name}</span>
                      {category.child_categories && category.child_categories.length > 0 && (
                        <div className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0">
                          {category.child_categories.length}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center transition-all ${
              !prevBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-100 hover:bg-accent'
            }`}
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
          >
            <RiArrowLeftSLine className="h-5 w-5" />
          </button>

          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center transition-all ${
              !nextBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-100 hover:bg-accent'
            }`}
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
          >
            <RiArrowRightSLine className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
} 