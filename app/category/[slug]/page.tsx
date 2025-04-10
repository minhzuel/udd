'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RiFilterLine, RiCloseLine, RiArrowDownSLine, RiArrowRightLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ProductCard from '@/components/product/ProductCard'
import { toast } from 'sonner'

interface Category {
  id: number
  name: string
  slug: string
  metaDescription: string | null
  imageUrl: string | null
  metaTitle: string | null
  childCategories: {
    id: number
    name: string
    slug: string
    imageUrl: string | null
    metaDescription: string | null
    metaTitle: string | null
  }[]
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  offerPrice: number | null
  offerExpiry: string | null
  sku: string
  mainImage: string
  inventory: { quantity: number }[]
  categoryId: number
  category: {
    id: number
    name: string
    slug: string
    parentCategory: {
      id: number
      name: string
      slug: string
    } | null
  }
  specifications: {
    name: string
    value: string
  }[]
  hasVariations?: boolean
  priceRange?: {
    min: number
    max: number
    minOffer: number | null
    maxOffer: number | null
    minDiscount: number
    maxDiscount: number
  }
  variations: {
    id: number
    name: string
    value: string
    combinations1: {
      id: number
      price: number
      stockQuantity: number
      variation2: {
        name: string
        value: string
      } | null
      variation3: {
        name: string
        value: string
      } | null
    }[]
  }[]
  variationCombinations?: Array<{
    id: number
    price: number
    offerPrice: number | null
    stockQuantity: number
    variation1?: {
      id: number
      name: string
      value: string
    }
    variation2?: {
      id: number
      name: string
      value: string
    }
    variation3?: {
      id: number
      name: string
      value: string
    }
  }>
}

interface FilterState {
  price: [number, number]
  sortBy: string
  inStock: boolean
  onSale: boolean
  subCategory: string
  variations: Record<string, string[]>
}

interface PaginationState {
  page: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function CategoryPage() {
  const params = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    price: [0, 15000],
    sortBy: 'newest',
    inStock: false,
    onSale: false,
    subCategory: 'all',
    variations: {}
  })
  const [availableVariations, setAvailableVariations] = useState<Record<string, string[]>>({})
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    total: 0,
    totalPages: 0,
    hasMore: true
  })
  const [inputString, setInputString] = useState({
    min: '0',
    max: '15000'
  });
  const autoSubmitTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProducts = async (page: number = 1, append: boolean = false) => {
    try {
      if (!params.slug) {
        throw new Error('Category slug is required')
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        minPrice: filters.price[0].toString(),
        maxPrice: filters.price[1].toString(),
        sortBy: filters.sortBy,
        inStock: filters.inStock.toString(),
        onSale: filters.onSale.toString(),
        subCategory: filters.subCategory,
        page: page.toString(),
        limit: '24'
      })

      // Add variation filters if they exist
      for (const [key, values] of Object.entries(filters.variations)) {
        if (values.length > 0) {
          queryParams.append(`variation_${key}`, values.join(','))
        }
      }

      // Use the base URL from the window location
      const baseUrl = window.location.origin
      const apiUrl = `${baseUrl}/api/categories/${params.slug}/products?${queryParams}`
      console.log('Making API request to:', apiUrl)

      // Fetch products for this category
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      
      console.log('API response status:', response.status)
      console.log('API response headers:', Object.fromEntries(response.headers.entries()))
      
      let errorData
      if (!response.ok) {
        try {
          errorData = await response.json()
          console.error('API error response (JSON):', errorData)
        } catch (e) {
          const textResponse = await response.text()
          console.error('API error response (Text):', textResponse)
          errorData = { error: textResponse || 'Failed to parse error response' }
        }
        throw new Error(errorData.error || errorData.details || `Failed to fetch products (${response.status})`)
      }

      let data
      try {
        data = await response.json()
        console.log('API response data:', data)
        console.log('Products received:', data.products ? data.products.length : 0)
        
        if (data.products && data.products.length === 0) {
          console.log('No products found with current filters:', filters)
        }
      } catch (e) {
        console.error('Failed to parse API response:', e)
        throw new Error('Invalid JSON response from API')
      }

      if (!data.category || !data.products) {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response format')
      }

      if (!append) {
        setCategory(data.category)
      }

      // Transform the products to match the ProductCard interface
      const transformedProducts = data.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
        offerExpiry: product.offerEndDate,
        sku: product.sku || '',
        mainImage: product.mainImage || '/images/placeholder.png',
        inventory: product.inventory || [{ quantity: 0 }],
        categoryId: product.categoryId,
        category: {
          id: product.categoryId,
          name: product.category.name,
          slug: product.category.slug,
          parentCategory: null
        },
        specifications: product.specifications || [],
        hasVariations: product.hasVariations || false,
        priceRange: product.priceRange || {
          min: Number(product.price),
          max: Number(product.price),
          minOffer: product.offerPrice ? Number(product.offerPrice) : null,
          maxOffer: product.offerPrice ? Number(product.offerPrice) : null,
          minDiscount: product.offerPrice ? Math.round(((Number(product.price) - Number(product.offerPrice)) / Number(product.price)) * 100) : 0,
          maxDiscount: product.offerPrice ? Math.round(((Number(product.price) - Number(product.offerPrice)) / Number(product.price)) * 100) : 0
        },
        variations: product.variations || [],
        variationCombinations: product.variationCombinations || []
      }))
      
      console.log('Transformed products:', transformedProducts.length)
      
      setProducts(prev => append ? [...prev, ...transformedProducts] : transformedProducts)
      setPagination({
        page: data.pagination.page,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasMore: data.pagination.page < data.pagination.totalPages
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      console.error('Error fetching category data:', error)
      setError(message)
      toast.error(message)
      if (!append) {
        setProducts([])
        setCategory(null)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchProducts(1, false)
  }, [params.slug, filters])

  const loadMore = () => {
    if (!loadingMore && pagination.hasMore) {
      setLoadingMore(true)
      fetchProducts(pagination.page + 1, true)
    }
  }

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !loadingMore && pagination.hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const loadMoreTrigger = document.getElementById('load-more-trigger')
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger)
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger)
      }
    }
  }, [loadingMore, pagination.hasMore])

  // Initialize input fields with filter values
  useEffect(() => {
    setInputString({
      min: filters.price[0].toString(),
      max: filters.price[1].toString()
    });
  }, []);

  // Handle direct input in the price fields
  const handlePriceInput = (type: 'min' | 'max', value: string) => {
    // Allow only digits, no validation yet - just capture raw input
    if (/^\d*$/.test(value)) {
      // Use document.getElementById instead of React state to prevent re-renders during typing
      const inputField = document.getElementById(type === 'min' ? 'min-price' : 'max-price') as HTMLInputElement;
      const mobileInputField = document.getElementById(type === 'min' ? 'mobile-min-price' : 'mobile-max-price') as HTMLInputElement;
      
      if (inputField) {
        inputField.value = value;
      }
      
      if (mobileInputField) {
        mobileInputField.value = value;
      }
      
      // Also update our state but don't trigger a re-render yet
      setInputString(prev => ({
        ...prev,
        [type]: value
      }));
      
      // Clear any existing timer
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
      
      // Set a new timer for 4 seconds
      autoSubmitTimerRef.current = setTimeout(() => {
        applyPriceFilter();
      }, 4000);
    }
  };

  // Apply price filter with validation
  const applyPriceFilter = () => {
    // Get current values directly from the input fields
    const minField = document.getElementById('min-price') as HTMLInputElement;
    const maxField = document.getElementById('max-price') as HTMLInputElement;
    
    // Use field values if available, otherwise fall back to state
    const minValue = minField ? parseInt(minField.value || '0') : parseInt(inputString.min || '0');
    const maxValue = maxField ? parseInt(maxField.value || '15000') : parseInt(inputString.max || '15000');
    
    // Handle invalid values
    const validMin = isNaN(minValue) ? 0 : Math.max(0, minValue);
    const validMax = isNaN(maxValue) ? 15000 : Math.max(validMin, maxValue);
    
    // Update filter state
    setFilters(prev => ({ ...prev, price: [validMin, validMax] }));
    
    // Update input string state to match
    setInputString({
      min: validMin.toString(),
      max: validMax.toString()
    });
    
    // Update input field values directly
    if (minField) minField.value = validMin.toString();
    if (maxField) maxField.value = validMax.toString();
    
    // Also update mobile fields
    const mobileMinField = document.getElementById('mobile-min-price') as HTMLInputElement;
    const mobileMaxField = document.getElementById('mobile-max-price') as HTMLInputElement;
    
    if (mobileMinField) mobileMinField.value = validMin.toString();
    if (mobileMaxField) mobileMaxField.value = validMax.toString();
    
    // Clear timer
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
  };

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value }))
  }

  const handleCheckboxChange = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, subCategory: value }))
  }

  const handleVariationChange = (name: string, value: string) => {
    setFilters(prev => {
      const currentValues = prev.variations[name] || []
      const newValues = currentValues.includes(value) 
        ? currentValues.filter(v => v !== value) // Remove if already present
        : [...currentValues, value] // Add if not present
      
      return {
        ...prev,
        variations: {
          ...prev.variations,
          [name]: newValues
        }
      }
    })
  }

  // Extract unique variations from products for filters
  useEffect(() => {
    if (products.length > 0) {
      const variations: Record<string, Set<string>> = {}
      
      products.forEach(product => {
        // Check for product variations from variationCombinations
        if (product.variationCombinations && product.variationCombinations.length > 0) {
          product.variationCombinations.forEach(combo => {
            if (combo.variation1) {
              const name = combo.variation1.name;
              const value = combo.variation1.value;
              
              if (!variations[name]) {
                variations[name] = new Set();
              }
              variations[name].add(value);
            }
            
            if (combo.variation2) {
              const name = combo.variation2.name;
              const value = combo.variation2.value;
              
              if (!variations[name]) {
                variations[name] = new Set();
              }
              variations[name].add(value);
            }
            
            if (combo.variation3) {
              const name = combo.variation3.name;
              const value = combo.variation3.value;
              
              if (!variations[name]) {
                variations[name] = new Set();
              }
              variations[name].add(value);
            }
          });
        }
        
        // Also check for variations array
        if (product.variations && product.variations.length > 0) {
          product.variations.forEach(variation => {
            if (!variations[variation.name]) {
              variations[variation.name] = new Set()
            }
            variations[variation.name].add(variation.value)
          })
        }
      })
      
      // Convert Sets to arrays
      const result: Record<string, string[]> = {}
      for (const [key, valueSet] of Object.entries(variations)) {
        result[key] = Array.from(valueSet)
      }
      
      console.log('Available variations:', result);
      setAvailableVariations(result)
    }
  }, [products])

  const groupedProducts = products.reduce((acc, product) => {
    const categorySlug = product.category.slug
    if (!acc[categorySlug]) {
      acc[categorySlug] = []
    }
    acc[categorySlug].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  // Price Range Filter Component
  const PriceRangeFilter = () => (
    <div className="space-y-4">
      <h3 className="font-medium">Price Range</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="min-price" className="mb-1.5 block text-sm font-medium text-gray-700">Min Price</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="min-price"
                type="text"
                inputMode="numeric"
                defaultValue={inputString.min}
                onChange={(e) => handlePriceInput('min', e.target.value)}
                className="w-full pl-7 py-2 h-10 text-base rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="max-price" className="mb-1.5 block text-sm font-medium text-gray-700">Max Price</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="max-price"
                type="text"
                inputMode="numeric"
                defaultValue={inputString.max}
                onChange={(e) => handlePriceInput('max', e.target.value)}
                className="w-full pl-7 py-2 h-10 text-base rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="15000"
              />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={applyPriceFilter}
          className="w-full bg-primary hover:bg-primary/90 text-white"
          size="md"
        >
          Apply Price Range
        </Button>
      </div>
    </div>
  )

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Subcategories */}
      {category?.childCategories && category.childCategories.length > 0 && (
        <>
          <div className="space-y-4">
            <h3 className="font-medium">Categories</h3>
            <RadioGroup value={filters.subCategory} onValueChange={handleSubCategoryChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All {category.name}</Label>
              </div>
              {category.childCategories.map((subCategory) => (
                <div key={subCategory.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={subCategory.slug} id={subCategory.slug} />
                  <div className="flex items-center space-x-2">
                    {subCategory.imageUrl && (
                      <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center">
                        <img 
                          src={subCategory.imageUrl} 
                          alt={subCategory.name}
                          className="max-w-full max-h-full object-contain"
                          width={18}
                          height={18}
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor={subCategory.slug}>{subCategory.name}</Label>
                      {subCategory.metaDescription && (
                        <p className="text-xs text-muted-foreground">{subCategory.metaDescription}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Separator />
        </>
      )}

      {/* Price Range */}
      <PriceRangeFilter />

      <Separator />

      {/* Availability */}
      <div className="space-y-4">
        <h3 className="font-medium">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock}
              onCheckedChange={() => handleCheckboxChange('inStock')}
            />
            <Label htmlFor="inStock">In Stock</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onSale"
              checked={filters.onSale}
              onCheckedChange={() => handleCheckboxChange('onSale')}
            />
            <Label htmlFor="onSale">On Sale</Label>
          </div>
        </div>
      </div>

      {/* Variations Filters - only show if variations exist */}
      {Object.keys(availableVariations).length > 0 && (
        <>
          <Separator />
          
          {Object.entries(availableVariations).map(([name, values]) => (
            <div key={name} className="space-y-4">
              <h3 className="font-medium">{name}</h3>
              <div className="space-y-2">
                {values.map(value => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${name}-${value}`}
                      checked={(filters.variations[name] || []).includes(value)}
                      onCheckedChange={() => handleVariationChange(name, value)}
                    />
                    <Label htmlFor={`${name}-${value}`}>{value}</Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <p className="text-destructive text-center max-w-md">{error}</p>
          <div className="flex space-x-4">
            <Button onClick={() => window.location.reload()} variant="primary">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            If the problem persists, please contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {error ? (
        <div className="max-w-md mx-auto rounded-lg border p-6 bg-white shadow-sm text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-3">Error Loading Products</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Please try again or contact support if the problem persists.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filter sidebar for large screens */}
            <div className="hidden md:block w-full md:w-64 lg:w-72 space-y-6 h-fit">
              <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFilters({
                        price: [0, 15000],
                        sortBy: 'newest',
                        inStock: false,
                        onSale: false,
                        subCategory: 'all',
                        variations: {}
                      })
                    }}
                  >
                    Clear All
                  </Button>
                </div>
                <FilterSidebar />
              </div>
            </div>

            {/* Products Grid with title */}
            <div className="flex-1">
              {category && (
                <div className="mb-6 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="md:hidden">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm" className="md:hidden flex items-center gap-2">
                            <RiFilterLine className="h-4 w-4" />
                            Filters
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="overflow-auto">
                          <SheetHeader className="mb-5">
                            <SheetTitle>Filters</SheetTitle>
                          </SheetHeader>
                          <div className="space-y-6">
                            {/* Mobile Price Range */}
                            <div className="space-y-4">
                              <h3 className="font-medium">Price Range</h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor="mobile-min-price" className="mb-1.5 block text-sm font-medium text-gray-700">Min Price</Label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                      </div>
                                      <input
                                        id="mobile-min-price"
                                        type="text"
                                        inputMode="numeric"
                                        defaultValue={inputString.min}
                                        onChange={(e) => handlePriceInput('min', e.target.value)}
                                        className="w-full pl-7 py-2 h-10 text-base rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="mobile-max-price" className="mb-1.5 block text-sm font-medium text-gray-700">Max Price</Label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                      </div>
                                      <input
                                        id="mobile-max-price"
                                        type="text"
                                        inputMode="numeric"
                                        defaultValue={inputString.max}
                                        onChange={(e) => handlePriceInput('max', e.target.value)}
                                        className="w-full pl-7 py-2 h-10 text-base rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                        placeholder="15000"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <Button 
                                  onClick={applyPriceFilter}
                                  className="w-full bg-primary hover:bg-primary/90 text-white"
                                  size="md"
                                >
                                  Apply Price Range
                                </Button>
                              </div>
                            </div>

                            <Separator />
                            
                            {/* Mobile Subcategories */}
                            {category?.childCategories && category.childCategories.length > 0 && (
                              <>
                                <div className="space-y-4">
                                  <h3 className="font-medium">Categories</h3>
                                  <RadioGroup value={filters.subCategory} onValueChange={handleSubCategoryChange}>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="all" id="mobile-all" />
                                      <Label htmlFor="mobile-all">All {category.name}</Label>
                                    </div>
                                    {category.childCategories.map((subCategory) => (
                                      <div key={`mobile-${subCategory.id}`} className="flex items-center space-x-2">
                                        <RadioGroupItem value={subCategory.slug} id={`mobile-${subCategory.slug}`} />
                                        <Label htmlFor={`mobile-${subCategory.slug}`}>{subCategory.name}</Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </div>
                                <Separator />
                              </>
                            )}

                            {/* Mobile Availability */}
                            <div className="space-y-4">
                              <h3 className="font-medium">Availability</h3>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="mobile-inStock"
                                    checked={filters.inStock}
                                    onCheckedChange={() => handleCheckboxChange('inStock')}
                                  />
                                  <Label htmlFor="mobile-inStock">In Stock</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="mobile-onSale"
                                    checked={filters.onSale}
                                    onCheckedChange={() => handleCheckboxChange('onSale')}
                                  />
                                  <Label htmlFor="mobile-onSale">On Sale</Label>
                                </div>
                              </div>
                            </div>

                            {/* Mobile Variations Filters */}
                            {Object.keys(availableVariations).length > 0 && (
                              <>
                                <Separator />
                                
                                {Object.entries(availableVariations).map(([name, values]) => (
                                  <div key={`mobile-${name}`} className="space-y-4">
                                    <h3 className="font-medium">{name}</h3>
                                    <div className="space-y-2">
                                      {values.map(value => (
                                        <div key={`mobile-${name}-${value}`} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`mobile-${name}-${value}`}
                                            checked={(filters.variations[name] || []).includes(value)}
                                            onCheckedChange={() => handleVariationChange(name, value)}
                                          />
                                          <Label htmlFor={`mobile-${name}-${value}`}>{value}</Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}

                            <div className="pt-4">
                              <Button 
                                className="w-full"
                                onClick={() => {
                                  setFilters({
                                    price: [0, 15000],
                                    sortBy: 'newest',
                                    inStock: false,
                                    onSale: false,
                                    subCategory: 'all',
                                    variations: {}
                                  })
                                }}
                              >
                                Clear All Filters
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                  </div>
                  <div className="flex items-center">
                    <Select value={filters.sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  {pagination.hasMore && (
                    <div
                      id="load-more-trigger"
                      className="h-10 flex items-center justify-center mt-8"
                    >
                      {loadingMore ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      ) : (
                        <Button variant="outline" onClick={loadMore}>
                          Load More
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600">Try adjusting your filters or browse other categories.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 