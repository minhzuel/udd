'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'
import ProductCard from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { RiArrowRightLine } from '@remixicon/react'

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  offerPrice: number | null;
  offerExpiry: string | null;
  sku: string;
  mainImage: string;
  inventory: { quantity: number }[];
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
    parentCategory: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
  specifications: {
    name: string;
    value: string;
  }[];
  hasVariations?: boolean;
  priceRange?: {
    min: number;
    max: number;
    minOffer: number | null;
    maxOffer: number | null;
    minDiscount: number;
    maxDiscount: number;
  };
  variations: {
    id: number;
    name: string;
    value: string;
    combinations1: {
      id: number;
      price: number;
      stockQuantity: number;
      variation2: {
        name: string;
        value: string;
      } | null;
      variation3: {
        name: string;
        value: string;
      } | null;
    }[];
  }[];
  variationCombinations?: Array<{
    id: number;
    price: number;
    offerPrice: number | null;
    stockQuantity: number;
  }>;
}

export function NewCollection() {
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 1536px)': { slidesToScroll: 6 },
      '(min-width: 1280px)': { slidesToScroll: 6 },
      '(min-width: 1024px)': { slidesToScroll: 6 },
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/latest')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        
        // Transform the data to match the ProductCard component's expected format
        const transformedProducts = data.map((product: any) => {
          // Check if product has variations or variation combinations
          const hasVariations = 
            (product.variations && product.variations.length > 0) || 
            (product.variationCombinations && product.variationCombinations.length > 0);
          
          let priceRange;
          
          if (hasVariations && product.variationCombinations && product.variationCombinations.length > 0) {
            // Get all prices from variations
            const prices = product.variationCombinations.map((v: any) => Number(v.price));
            const offerPrices = product.variationCombinations
              .filter((v: any) => v.offerPrice)
              .map((v: any) => Number(v.offerPrice));
            
            // Calculate min and max prices
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            
            // Calculate min and max offer prices
            const minOffer = offerPrices.length > 0 ? Math.min(...offerPrices) : null;
            const maxOffer = offerPrices.length > 0 ? Math.max(...offerPrices) : null;
            
            // Calculate discounts
            const minDiscount = minOffer !== null ? Math.round(((min - minOffer) / min) * 100) : 0;
            const maxDiscount = maxOffer !== null ? Math.round(((max - maxOffer) / max) * 100) : 0;
            
            priceRange = {
              min,
              max,
              minOffer,
              maxOffer,
              minDiscount,
              maxDiscount
            };
          } else {
            // For products without variations
            priceRange = {
              min: Number(product.price),
              max: Number(product.price),
              minOffer: product.offerPrice ? Number(product.offerPrice) : null,
              maxOffer: product.offerPrice ? Number(product.offerPrice) : null,
              minDiscount: product.offerPrice ? Math.round(((Number(product.price) - Number(product.offerPrice)) / Number(product.price)) * 100) : 0,
              maxDiscount: product.offerPrice ? Math.round(((Number(product.price) - Number(product.offerPrice)) / Number(product.price)) * 100) : 0
            };
          }
          
          return {
            ...product,
            hasVariations,
            priceRange,
            // Set specifications to empty array to remove information icon
            specifications: [],
            // Ensure name is truncated
            name: product.name?.length > 30 ? `${product.name.substring(0, 30)}...` : product.name
          };
        });
        
        setProducts(transformedProducts);
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      fetchProducts()
    }
  }, [mounted])

  // Show loading state
  if (!mounted || isLoading) {
    return (
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">New collection</h2>
            <Button variant="ghost" disabled>View all</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">New collection</h2>
          <Link href="/products">
            <Button variant="ghost" className="flex items-center gap-1">
              View all
              <RiArrowRightLine className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="relative">
          {/* For medium and large screens, use grid layout to ensure 6 cards */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-3">
            {products.slice(0, 6).map((product) => (
              <div key={product.id}>
                <ProductCard 
                  product={product} 
                  className="h-full"
                />
              </div>
            ))}
          </div>
          
          {/* For mobile screens, use carousel */}
          <div className="block md:hidden relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-3">
                {products.map((product) => (
                  <div key={product.id} className="flex-[0_0_calc(50%-6px)]">
                    <ProductCard 
                      product={product} 
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-10 h-20 rounded-l-lg bg-white border shadow-md flex items-center justify-center transition-all hover:bg-gray-50 hover:shadow-lg z-10 ${
                !prevBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-100'
              }`}
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              aria-label="Previous page"
            >
              <RiArrowLeftSLine className="h-6 w-6" />
            </button>

            <button
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-10 h-20 rounded-r-lg bg-white border shadow-md flex items-center justify-center transition-all hover:bg-gray-50 hover:shadow-lg z-10 ${
                !nextBtnEnabled ? 'opacity-0 cursor-default' : 'opacity-100'
              }`}
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              aria-label="Next page"
            >
              <RiArrowRightSLine className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 