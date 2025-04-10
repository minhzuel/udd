'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import ProductCard from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { RiArrowRightLine } from '@remixicon/react'
import Link from 'next/link'

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

export default function CollectedSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [showInfiniteScroll, setShowInfiniteScroll] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const lastProductRef = useCallback((node: HTMLDivElement) => {
    if (loading || !showInfiniteScroll) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, showInfiniteScroll])

  // Common function to transform product data for ProductCard
  const transformProductData = (product: any) => {
    // Enhanced variation detection to handle different response formats
    const hasVariations = Boolean(
      // Check product_type first as it's the most reliable indicator
      (product.product_type && typeof product.product_type === 'string' && 
       (product.product_type.includes('variable') || product.product_type.includes('variation'))) ||
      // Then check for explicit variation arrays
      (product.variations && Array.isArray(product.variations) && product.variations.length > 0) || 
      (product.variationCombinations && Array.isArray(product.variationCombinations) && product.variationCombinations.length > 0) ||
      (product.ProductToVariation && Array.isArray(product.ProductToVariation) && product.ProductToVariation.length > 0) ||
      // Check for serialized variations in the variations field (string format)
      (typeof product.variations === 'string' && product.variations !== '[]') ||
      // Backend might indicate variable products by having null price or special SKU format
      (product.sku && product.sku.includes('-var')) ||
      // Some variable products have a '-parent' suffix in the database
      (product.sku && product.sku.includes('-parent'))
    );
    
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
        minOffer: product.offerPrice ? Number(product.offerPrice) : (product.offer_price ? Number(product.offer_price) : null),
        maxOffer: product.offerPrice ? Number(product.offerPrice) : (product.offer_price ? Number(product.offer_price) : null),
        minDiscount: product.offerPrice || product.offer_price ? 
          Math.round(((Number(product.price) - Number(product.offerPrice || product.offer_price)) / Number(product.price)) * 100) : 0,
        maxDiscount: product.offerPrice || product.offer_price ? 
          Math.round(((Number(product.price) - Number(product.offerPrice || product.offer_price)) / Number(product.price)) * 100) : 0
      };
    }
    
    // Process variations from different possible sources
    let variations = [];
    
    // Parse variations if they're serialized as a string
    if (typeof product.variations === 'string' && product.variations.trim() !== '' && product.variations !== '[]') {
      try {
        const parsedVariations = JSON.parse(product.variations);
        if (Array.isArray(parsedVariations)) {
          variations = parsedVariations;
        }
      } catch (e) {
        console.error('Error parsing variations string:', e);
      }
    }
    // If variations is already an array, use it
    else if (product.variations && Array.isArray(product.variations)) {
      variations = product.variations;
    } 
    // Check for ProductToVariation
    else if (product.ProductToVariation && Array.isArray(product.ProductToVariation)) {
      variations = product.ProductToVariation.map((ptv: any) => ({
        id: ptv.product_variations?.variation_id || ptv.variation_id,
        name: ptv.product_variations?.name || ptv.name,
        value: ptv.product_variations?.value || ptv.value
      }));
    }
    
    // Ensure variations is not empty if hasVariations is true
    if (hasVariations && variations.length === 0) {
      // Add placeholder variation to ensure "Choose Option" is shown
      variations = [{ id: 0, name: "Option", value: "Default" }];
    }
    
    // Setting specifications to empty array to remove specification icon from all product cards
    let specifications = [];
    
    // Force hasVariations based on product_type for items loaded in infinite scroll
    // This is a fallback to ensure consistency with initial loaded items
    if (product.product_type && 
        typeof product.product_type === 'string' && 
        !hasVariations && 
        product.product_type !== 'simple') {
      console.log('Forcing hasVariations for product:', product.name);
    }
    
    return {
      ...product,
      // Important - these fields must be consistent for both initial and infinite scroll loads
      id: product.id || product.product_id,
      product_id: product.product_id || product.id,
      hasVariations, // This flag controls "Choose Option" vs "View Product" button
      variations, // Normalized variations array
      priceRange,
      mainImage: product.mainImage || product.main_image,
      main_image: product.main_image || product.mainImage,
      offerPrice: product.offerPrice || product.offer_price,
      offer_price: product.offer_price || product.offerPrice,
      // Always provide empty specifications array to remove specification icon
      specifications: [],
      // Ensure name is truncated
      name: product.name?.length > 30 ? `${product.name.substring(0, 30)}...` : product.name
    };
  };

  const fetchProducts = async (pageNum: number) => {
    try {
      setLoading(true)
      const skip = (pageNum - 1) * 12
      const response = await fetch(`/api/products?skip=${skip}&take=12`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      
      // Use common transform function
      const transformedProducts = data.map(transformProductData);
      
      if (pageNum === 1) {
        setProducts(transformedProducts)
      } else {
        setProducts(prev => [...prev, ...transformedProducts])
      }
      
      // If we got less than 12 products, we've reached the end
      setHasMore(data.length === 12)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchInitialProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/initial-products')
      if (!response.ok) {
        throw new Error('Failed to fetch initial products')
      }
      const data = await response.json()
      
      // Use the same transformation function for consistency
      const transformedProducts = data.map(transformProductData);
      
      setProducts(transformedProducts)
      setHasMore(data.length === 12)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch initial products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialProducts()
  }, [])

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchProducts(nextPage)
    }
  }

  const handleLoadMoreClick = () => {
    setShowInfiniteScroll(true)
    loadMore()
  }

  // Check if we should show the Load More button
  const shouldShowLoadMore = products.length > 0 && products.length % 12 === 0 && hasMore && !loading && !showInfiniteScroll

  if (error) {
    return (
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            Error loading products: {error}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Collection for you</h2>
          <Link href="/products">
            <Button variant="ghost" className="flex items-center gap-1">
              View all
              <RiArrowRightLine className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={`skeleton-${i}`} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {products.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  ref={index === products.length - 1 ? lastProductRef : undefined}
                >
                  <ProductCard product={product} className="h-full" />
                </div>
              ))}
            </div>
            {loading && products.length > 0 && (
              <div className="flex justify-center mt-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            )}
            {shouldShowLoadMore && (
              <div className="text-center mt-6">
                <Button
                  onClick={handleLoadMoreClick}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <div className="text-center mt-6 text-gray-500 text-sm">
                No more products to load
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
} 