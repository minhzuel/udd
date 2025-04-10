'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RiShoppingCart2Line, RiFlashlightLine, RiSettings4Line, RiEyeLine, RiInformationLine } from '@remixicon/react'
import { AddToCartButton, OrderNowButton } from '@/components/ui/buttons'
import { memo } from 'react'
import { useCart } from '@/app/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RiCheckLine } from '@remixicon/react'
import { Separator } from '@/components/ui/separator'
import { useCurrency } from '@/app/contexts/CurrencyContext'

interface Product {
  id?: number
  product_id?: number
  name: string
  description?: string
  price: number
  offerPrice?: number | null
  offer_price?: number | null
  offerExpiry?: string | null
  offer_expiry?: string | null
  sku?: string
  mainImage?: string
  main_image?: string
  inventory?: { quantity: number }[]
  categoryId?: number
  category_id?: number
  category?: {
    id: number
    name: string
    slug: string
    parentCategory?: {
      id: number
      name: string
      slug: string
    } | null
  }
  categories?: {
    category_id: number
    category_name: string
    slug: string
    parent_category_id?: number
  }
  specifications?: {
    name: string
    value: string
  }[]
  product_specifications?: {
    specification_name: string
    specification_value: string
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
  variations?: {
    id: number
    name: string
    value: string
    combinations1?: {
      id: number
      price: number
      stockQuantity: number
      variation2?: {
        name: string
        value: string
      } | null
      variation3?: {
        name: string
        value: string
      } | null
    }[]
  }[]
}

interface ProductCardProps {
  product: Product
  className?: string
}

const ProductCard = memo(function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addItem, totalItems } = useCart();
  const router = useRouter();
  const [showVariations, setShowVariations] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const { formatPrice } = useCurrency();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: (product.id || product.product_id || '').toString(),
      name: product.name,
      price: product.offerPrice || product.offer_price || product.price,
      quantity: 1,
      image: product.mainImage || product.main_image || '/media/products/placeholder.png',
      variations: Object.keys(selectedVariations).length > 0 ? 
        Object.entries(selectedVariations).map(([name, value]) => ({ name, value })) : 
        undefined
    });
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: (product.id || product.product_id || '').toString(),
      name: product.name,
      price: product.offerPrice || product.offer_price || product.price,
      quantity: 1,
      image: product.mainImage || product.main_image || '/media/products/placeholder.png',
      variations: Object.keys(selectedVariations).length > 0 ? 
        Object.entries(selectedVariations).map(([name, value]) => ({ name, value })) : 
        undefined
    });
    router.push('/checkout');
  };

  const handleVariationChange = (name: string, value: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const discountPercentage = (product.offerPrice || product.offer_price)
    ? Math.round(((product.price - (product.offerPrice || product.offer_price || 0)) / product.price) * 100)
    : 0;

  // Group variations by name
  const groupedVariations = product.variations?.reduce((acc, variation) => {
    if (!acc[variation.name]) {
      acc[variation.name] = [];
    }
    acc[variation.name].push(variation);
    return acc;
  }, {} as Record<string, typeof product.variations>) || {};

  return (
    <>
      <Link 
        href={`/product/${product.id || product.product_id}`}
        className={`flex flex-col group ${className}`}
      >
        <div className="relative group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
          <div className="relative aspect-square overflow-hidden p-2">
            <div className="relative w-full h-full rounded-md overflow-hidden">
              <Image
                src={product.mainImage || product.main_image || '/images/placeholder.png'}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </div>
            {(product.hasVariations && product.priceRange && product.priceRange.maxDiscount > 0) ? (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                {product.priceRange.minDiscount === product.priceRange.maxDiscount 
                  ? `${product.priceRange.maxDiscount}% OFF`
                  : `${product.priceRange.minDiscount}-${product.priceRange.maxDiscount}% OFF`}
              </div>
            ) : discountPercentage > 0 ? (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                {discountPercentage}% OFF
              </div>
            ) : null}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{product.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              {product.hasVariations && product.priceRange ? (
                <div>
                  {product.priceRange.minOffer !== null || product.priceRange.maxOffer !== null ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(product.priceRange.min)} - {formatPrice(product.priceRange.max)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-red-600">
                          {formatPrice(product.priceRange.minOffer !== null ? product.priceRange.minOffer : product.priceRange.min)} - 
                          {formatPrice(product.priceRange.maxOffer !== null ? product.priceRange.maxOffer : product.priceRange.max)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm font-bold">
                      {formatPrice(product.priceRange.min)} - {formatPrice(product.priceRange.max)}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  {product.offerPrice ? (
                    <>
                      <span className="text-xs text-gray-500 line-through">{formatPrice(Number(product.price))}</span>
                      <span className="text-sm font-bold text-red-600">{formatPrice(Number(product.offerPrice))}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold">{formatPrice(Number(product.price))}</span>
                  )}
                </>
              )}
            </div>
            {/* Removing both View Product and Choose Option buttons */}
          </div>
        </div>
      </Link>

      <Dialog open={showVariations} onOpenChange={setShowVariations}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RiSettings4Line className="h-5 w-5 text-primary" />
              Product Options for {product.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 mr-3">
                <Image
                  src={product.mainImage || product.main_image || '/images/placeholder.png'}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-base">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.description?.substring(0, 60)}...</p>
                <div className="flex items-center gap-2 mt-1">
                  {product.priceRange ? (
                    <div className="flex flex-col">
                      {product.priceRange.minOffer !== null || product.priceRange.maxOffer !== null ? (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(product.priceRange.min)} - {formatPrice(product.priceRange.max)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-red-600">
                              {formatPrice(product.priceRange.minOffer !== null ? product.priceRange.minOffer : product.priceRange.min)} - 
                              {formatPrice(product.priceRange.maxOffer !== null ? product.priceRange.maxOffer : product.priceRange.max)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm font-bold">
                          {formatPrice(product.priceRange.min)} - {formatPrice(product.priceRange.max)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      {product.offerPrice ? (
                        <>
                          <span className="text-xs text-gray-500 line-through">{formatPrice(Number(product.price))}</span>
                          <span className="text-sm font-bold text-red-600">{formatPrice(Number(product.offerPrice))}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold">{formatPrice(Number(product.price))}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <Separator />
            {Object.entries(groupedVariations).map(([name, variations]) => (
              <div key={name} className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <RiSettings4Line className="h-4 w-4 mr-1.5 text-primary" />
                  {name}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {variations.map((variation) => (
                    <button
                      key={variation.id}
                      onClick={() => handleVariationChange(name, variation.value)}
                      className={`flex items-center justify-center rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors ${
                        selectedVariations[name] === variation.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted hover:border-primary/50'
                      } ${
                        name === 'Color' ? 'w-8 h-8 rounded-full' : ''
                      }`}
                      style={
                        name === 'Color'
                          ? {
                              backgroundColor: variation.value.toLowerCase(),
                              borderColor: variation.value.toLowerCase() === 'white' ? '#e5e7eb' : 'transparent',
                            }
                          : undefined
                      }
                    >
                      {name !== 'Color' && variation.value}
                      {selectedVariations[name] === variation.value && name !== 'Color' && (
                        <RiCheckLine className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-1.5">
                <RiShoppingCart2Line className="h-4 w-4" />
                Add to Cart
              </Button>
              <Button onClick={handleOrderNow} variant="secondary" className="flex-1 flex items-center justify-center gap-1.5">
                <RiFlashlightLine className="h-4 w-4" />
                Order Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSpecs} onOpenChange={setShowSpecs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RiInformationLine className="h-5 w-5 text-primary" />
              Specifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-3">
                <Image
                  src={product.mainImage || product.main_image || '/images/placeholder.png'}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {product.offerPrice ? (
                    <>
                      <span className="text-xs text-gray-500 line-through">{formatPrice(Number(product.price))}</span>
                      <span className="text-sm font-bold text-red-600">{formatPrice(Number(product.offerPrice))}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold">{formatPrice(Number(product.price))}</span>
                  )}
                </div>
              </div>
            </div>
            <Separator />
            {product.specifications?.length ? (
              <div className="rounded-md border divide-y">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 text-sm px-3 py-2">
                    <div className="font-medium text-gray-700">{spec.name}</div>
                    <div className="text-gray-600">{spec.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No specifications available for this product.</p>
            )}
            <div className="flex justify-end">
              <Button 
                onClick={() => router.push(`/product/${product.id || product.product_id}`)}
                className="flex items-center justify-center gap-1.5"
              >
                <RiEyeLine className="h-4 w-4" />
                View Product Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
})

export default ProductCard 