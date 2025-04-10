'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Define the slide interface
interface Slide {
  id: number
  title: string
  description: string
  image: string
  link: string
}

// Sample data for the three different sliders
const heroSlides: Slide[] = [
  {
    id: 1,
    title: "Summer Sale",
    description: "Up to 50% off on selected items",
    image: "/images/slides/slide1.jpg",
    link: "/sale"
  },
  {
    id: 2,
    title: "New Arrivals",
    description: "Discover our latest collection",
    image: "/images/slides/slide2.jpg",
    link: "/new-arrivals"
  },
  {
    id: 3,
    title: "Special Offer",
    description: "Free shipping on orders over $50",
    image: "/images/slides/slide3.jpg",
    link: "/special-offers"
  }
]

const categorySlides = [
  {
    id: 1,
    title: "Electronics",
    description: "Latest gadgets",
    image: "/images/categories/electronics.jpg",
    link: "/category/electronics"
  },
  {
    id: 2,
    title: "Fashion",
    description: "Trending styles",
    image: "/images/categories/fashion.jpg",
    link: "/category/fashion"
  },
  {
    id: 3,
    title: "Home & Garden",
    description: "Make your space special",
    image: "/images/categories/home.jpg",
    link: "/category/home-garden"
  },
  {
    id: 4,
    title: "Beauty",
    description: "Skincare & makeup",
    image: "/images/categories/beauty.jpg",
    link: "/category/beauty"
  }
]

const promotionSlides = [
  {
    id: 1,
    title: "Flash Sale",
    description: "24 hours only",
    image: "/images/promotions/flash-sale.jpg",
    link: "/flash-sale"
  },
  {
    id: 2,
    title: "Clearance",
    description: "Last chance to buy",
    image: "/images/promotions/clearance.jpg",
    link: "/clearance"
  },
  {
    id: 3,
    title: "New Season",
    description: "Fresh arrivals",
    image: "/images/promotions/new-season.jpg",
    link: "/new-season"
  }
]

// Reusable slider component
function Slider({ slides, aspectRatio = "aspect-[16/9]", className = "" }: { 
  slides: Slide[], 
  aspectRatio?: string,
  className?: string
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  
  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    
    return () => clearInterval(timer)
  }, [slides.length])
  
  // Handle touch events for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }
    
    if (touchEnd - touchStart > 50) {
      // Swipe right
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }
  }
  
  return (
    <div 
      className={cn("relative overflow-hidden rounded-lg", aspectRatio, className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <Link href={slide.link}>
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-bold">{slide.title}</h3>
                <p className="text-sm text-white/80">{slide.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentSlide ? "bg-white w-4" : "bg-white/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Category card
function CategoryCard({ category }: { category: Slide }) {
  return (
    <Link 
      href={category.link}
      className="relative rounded-lg overflow-hidden flex-shrink-0 w-32 h-40"
    >
      <Image
        src={category.image}
        alt={category.title}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="absolute inset-0 p-2 flex flex-col justify-end">
        <h3 className="text-white font-medium text-sm">{category.title}</h3>
        <p className="text-white/80 text-xs">{category.description}</p>
      </div>
    </Link>
  )
}

// Scrollable category row
function CategoryRow({ categories }: { categories: Slide[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = direction === 'left' ? -150 : 150
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }
  
  return (
    <div className="relative">
      <div 
        className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-4" 
        ref={scrollRef}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
      
      {/* Scroll buttons */}
      <button 
        onClick={() => scroll('left')} 
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow-md z-10"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button 
        onClick={() => scroll('right')} 
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow-md z-10"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// Main component
export function MobileSliders() {
  return (
    <div className="space-y-4 py-3">
      {/* Hero Slider */}
      <section>
        <Slider 
          slides={heroSlides} 
          aspectRatio="aspect-[3/2]" 
          className="mx-4"
        />
      </section>
      
      {/* Promotions */}
      <section>
        <Slider 
          slides={promotionSlides} 
          aspectRatio="aspect-[16/6]" 
          className="mx-4"
        />
      </section>
    </div>
  )
} 