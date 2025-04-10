'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { RiArrowLeftSLine, RiArrowRightSLine, RiArrowRightLine } from '@remixicon/react'
import { Card, CardContent } from '@/components/ui/card'
import { AddButton } from '@/components/ui/add-button'
import { OrderNowButton } from '@/components/ui/order-now-button'

interface Product {
  id: number
  name: string
  sku: string
  price: number
  offerPrice: number | null
  description: string
  category: {
    id: number
    name: string
    slug: string
  }
  specifications: {
    name: string
    value: string
  }[]
  images: {
    imageUrl: string
    isMain: boolean
  }[]
  inventory: {
    quantity: number
  } | null
}

interface DealsSectionProps {
  deals: Product[]
}

export function DealsSection({ deals = [] }: DealsSectionProps) {
  const [mounted, setMounted] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 1536px)': { slidesToScroll: 6 },
      '(min-width: 1280px)': { slidesToScroll: 5 },
      '(min-width: 1024px)': { slidesToScroll: 4 },
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 640px)': { slidesToScroll: 2 },
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const calculateDiscount = (original: number, offer: number) => {
    if (!original || !offer) return 0
    return Math.round(((original - offer) / original) * 100)
  }

  if (!mounted) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Current Deals</h2>
          <Link 
            href="/deals" 
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all deals
            <RiArrowRightSLine className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {deals.map((product) => (
                <div
                  key={product.id}
                  className="flex-[0_0_calc(100%-8px)] sm:flex-[0_0_calc(50%-8px)] md:flex-[0_0_calc(33.333%-10.67px)] lg:flex-[0_0_calc(25%-12px)] xl:flex-[0_0_calc(20%-12.8px)] 2xl:flex-[0_0_calc(16.666%-13.33px)]"
                >
                  <Card className="overflow-hidden group h-full">
                    <CardContent className="p-0">
                      <Link href={`/product/${product.id}`} className="block">
                        <div className="relative">
                          <div className="aspect-[4/3] relative overflow-hidden">
                            <Image
                              src={product.thumbnail || "/images/products/default.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          {product.beforeDiscount && (
                            <div className="absolute top-1.5 right-1.5 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                              {calculateDiscount(product.beforeDiscount, product.price)}% OFF
                            </div>
                          )}
                        </div>
                        
                        <div className="p-2.5">
                          <h3 className="font-medium text-sm mb-0.5 truncate line-clamp-2 min-h-[2.5rem]">
                            {product.name.length > 21 ? `${product.name.substring(0, 21)}...` : product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1.5 truncate">{product.sku || 'No SKU'}</p>
                          
                          <div className="flex items-baseline gap-1.5 mb-2.5">
                            <span className="text-base font-semibold">{formatPrice(product.price)}</span>
                            {product.beforeDiscount && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.beforeDiscount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      
                      <div className="px-2.5 pb-2.5">
                        <div className="flex gap-1.5">
                          <AddButton
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            image={product.thumbnail || "/images/products/default.jpg"}
                            variations={product.variations}
                          />
                          <OrderNowButton 
                            size="xs" 
                            className="flex-1 h-7 text-xs px-2 bg-gradient-to-r from-green-800 via-green-700 to-green-600 hover:from-green-900 hover:via-green-800 hover:to-green-700 text-white border-0 shadow-sm"
                            productId={product.id}
                            productName={product.name}
                            productPrice={product.price}
                            productImage={product.thumbnail || "/images/products/default.jpg"}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-10 h-20 rounded-r-full bg-white border shadow-md flex items-center justify-center transition-all hover:bg-gray-50 hover:shadow-lg ${
              !prevBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-100'
            }`}
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
          >
            <RiArrowLeftSLine className="h-6 w-6" />
          </button>

          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-10 h-20 rounded-l-full bg-white border shadow-md flex items-center justify-center transition-all hover:bg-gray-50 hover:shadow-lg ${
              !nextBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-100'
            }`}
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
          >
            <RiArrowRightSLine className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  )
} 