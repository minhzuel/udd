'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';

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

export function OfferSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Items to show per page based on screen size
  const itemsPerPage = {
    desktop: 6,
    mobile: 2
  };
  
  // Track which view we're in
  const [isMobile, setIsMobile] = useState(false);
  
  // Calculate total pages
  const totalPages = Math.ceil(products.length / (isMobile ? itemsPerPage.mobile : itemsPerPage.desktop));

  useEffect(() => {
    // Function to fetch offers
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/products/offers');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Transform the data to match the ProductCard component's expected format
          const transformedProducts = data.map(product => {
            // Check if product has variations or variation combinations
            const hasVariations = 
              (product.variations && product.variations.length > 0) || 
              (product.variationCombinations && product.variationCombinations.length > 0);
            
            let priceRange;
            
            if (hasVariations && product.variationCombinations && product.variationCombinations.length > 0) {
              // Get all prices from variations
              const prices = product.variationCombinations.map(v => Number(v.price));
              const offerPrices = product.variationCombinations
                .filter(v => v.offerPrice)
                .map(v => Number(v.offerPrice));
              
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
              specifications: []
            };
          });
          
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initialize
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchOffers();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigate to previous page
  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  // Navigate to next page
  const nextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  // Get current items
  const getCurrentItems = () => {
    const itemsPerPageValue = isMobile ? itemsPerPage.mobile : itemsPerPage.desktop;
    const startIndex = currentPage * itemsPerPageValue;
    return products.slice(startIndex, startIndex + itemsPerPageValue);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Exclusive Deals</h2>
              <Button variant="ghost" disabled>View All</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: isMobile ? 2 : 6 }).map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no products with offers, don't show the section
  if (products.length === 0) {
    return null;
  }

  const currentItems = getCurrentItems();

  return (
    <div className="pt-10 pb-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Exclusive Deals</h2>
            <Link href="/deals">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {currentItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="h-full"
                />
              ))}
            </div>

            {totalPages > 1 && (
              <>
                <button
                  onClick={prevPage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-10 h-20 rounded-l-lg bg-white border shadow-md flex items-center justify-center transition-all hover:bg-gray-50 hover:shadow-lg z-10"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextPage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-10 h-20 rounded-r-lg bg-white border shadow-md flex items-center justify-center transition-all hover:bg-gray-50 hover:shadow-lg z-10"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 