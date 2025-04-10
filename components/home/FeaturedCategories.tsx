'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string;
  _count: {
    ecommerceProduct: number;
  };
  children: Category[];
}

export function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Items to show per page based on screen size
  const itemsPerPage = {
    desktop: 10,
    mobile: 3
  };
  
  // Track which view we're in
  const [isMobile, setIsMobile] = useState(false);
  
  // Calculate total pages
  const totalPages = Math.ceil(categories.length / (isMobile ? itemsPerPage.mobile : itemsPerPage.desktop));

  useEffect(() => {
    // Function to fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Flatten categories and their children
          const allCategories = data.reduce((acc: Category[], category) => {
            // Add main category
            acc.push({
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              image: category.image,
              _count: category._count,
              children: category.children
            });
            
            // Add child categories
            if (category.children && Array.isArray(category.children)) {
              category.children.forEach((child: Category) => {
                acc.push({
                  id: child.id,
                  name: child.name,
                  slug: child.slug,
                  description: child.description,
                  image: child.image,
                  _count: child._count,
                  children: child.children
                });
              });
            }
            
            return acc;
          }, []);
          
          setCategories(allCategories);
          setError(null);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch categories');
        setCategories([]);
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
    fetchCategories();
    
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
    return categories.slice(startIndex, startIndex + itemsPerPageValue);
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Featured Categories</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {Array.from({ length: isMobile ? 3 : 10 }).map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-36"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Featured Categories</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Featured Categories</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-center">
            No categories found
          </div>
        </div>
      </div>
    );
  }

  const currentItems = getCurrentItems();
  const showNavigation = categories.length > (isMobile ? itemsPerPage.mobile : itemsPerPage.desktop);

  return (
    <div className="pt-2 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Categories</h2>
        </div>
        
        <div className="relative">
          {/* Left Arrow */}
          {showNavigation && (
            <button 
              onClick={prevPage}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-1.5 bg-white border shadow-sm hover:bg-gray-100 rounded-sm"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 overflow-x-auto">
            {currentItems.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-full flex flex-col rounded-lg overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="w-full aspect-square flex items-center justify-center p-3 relative">
                    <Image
                      src={category.image?.startsWith('/') ? category.image : `/categories/${category.image}`}
                      alt={category.name}
                      width={100}
                      height={100}
                      className="object-contain transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="border-t border-gray-100 bg-gradient-to-b from-white/5 to-white/80 w-full h-2 relative z-10"></div>
                  <div className="p-3 pt-2 relative bg-white flex items-center justify-between">
                    <div className="flex-grow text-center">
                      <h3 className="font-medium text-sm line-clamp-1">{category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {category._count.ecommerceProduct} products
                      </p>
                    </div>
                    {category.children && category.children.length > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-5 text-center ml-1 flex-shrink-0">
                        {category.children.length}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Fill empty slots with placeholder */}
            {currentItems.length < (isMobile ? itemsPerPage.mobile : itemsPerPage.desktop) && 
              Array.from({ length: (isMobile ? itemsPerPage.mobile : itemsPerPage.desktop) - currentItems.length }).map((_, index) => (
                <div key={`empty-${index}`} className="w-full aspect-square rounded-lg opacity-0"></div>
              ))
            }
          </div>

          {/* Right Arrow */}
          {showNavigation && (
            <button 
              onClick={nextPage}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-1.5 bg-white border shadow-sm hover:bg-gray-100 rounded-sm"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 