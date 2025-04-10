'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types/product'
import ProductCard from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { RiArrowRightLine } from '@remixicon/react'
import Link from 'next/link'

// Function to normalize product data to ensure consistent format
const normalizeProductData = (product: any): Product => {
  // First determine if the product has variations
  const hasVariations = 
    (product.variations && Array.isArray(product.variations) && product.variations.length > 0) ||
    (product.ProductToVariation && Array.isArray(product.ProductToVariation) && product.ProductToVariation.length > 0);
  
  return {
    id: product.id || product.product_id,
    product_id: product.product_id || product.id,
    name: product.name,
    description: product.description,
    price: typeof product.price === 'number' ? product.price : Number(product.price || 0),
    offerPrice: product.offerPrice !== undefined ? product.offerPrice : product.offer_price,
    offer_price: product.offer_price !== undefined ? product.offer_price : product.offerPrice,
    mainImage: product.mainImage || product.main_image,
    main_image: product.main_image || product.mainImage,
    categoryId: product.categoryId || product.category_id,
    category_id: product.category_id || product.categoryId,
    category: product.category,
    specifications: product.specifications || product.product_specifications,
    hasVariations: hasVariations,
    variations: product.variations || (product.ProductToVariation ? 
      product.ProductToVariation.map((ptv: any) => ptv.product_variations) : 
      [])
  };
};

export default function CollectedSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async (pageNum: number) => {
    try {
      setLoading(true)
      // Use initial-products API for first page, regular products API for subsequent pages
      const endpoint = pageNum === 1 
        ? '/api/initial-products' 
        : `/api/products?skip=${(pageNum - 1) * 12}&take=12`
      
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      
      // Normalize all products to ensure consistent format
      const normalizedData = data.map(normalizeProductData)
      
      if (pageNum === 1) {
        setProducts(normalizedData)
      } else {
        setProducts(prev => [...prev, ...normalizedData])
      }
      
      // If we got less than 12 products, we've reached the end
      setHasMore(data.length === 12)
      setError(null)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(1)
  }, [])

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchProducts(nextPage)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading products: {error}
        </div>
      </div>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Collection for you</h2>
          <Link href="/products">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              View All <RiArrowRightLine className="ml-1" />
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg"></div>
                <div className="mt-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.product_id || product.id} 
                  product={product} 
                />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  className="min-w-[200px]"
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
} 