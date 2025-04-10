'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  RiArrowLeftLine, 
  RiShoppingCart2Line, 
  RiHeartLine, 
  RiShareLine, 
  RiTruckLine, 
  RiCustomerService2Line, 
  RiSecurePaymentLine, 
  RiShieldCheckLine, 
  RiCouponLine, 
  RiFlashlightLine,
  RiStarFill,
  RiStarLine,
  RiCheckLine,
  RiTruckFill,
  RiShieldCheckFill,
  RiCustomerServiceFill,
  RiSecurePaymentFill,
  RiSendPlaneFill,
  RiFileTextLine,
  RiInformationLine,
  RiQuestionLine
} from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useCart } from '@/app/contexts/CartContext'
import { OrderNowButton } from '@/components/ui/order-now-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShareProductModal } from '@/components/ui/share-product-modal'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import React from 'react'
import { useCurrency } from '@/app/contexts/CurrencyContext'

// Map standard color names to their hex values
const colorMap: Record<string, string> = {
  'red': '#FF0000',
  'blue': '#0000FF',
  'green': '#008000',
  'yellow': '#FFFF00',
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
  'navy': '#000080',
  'teal': '#008080',
  'maroon': '#800000',
  'olive': '#808000',
  'lime': '#00FF00',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  'navy blue': '#000080',
  'space gray': '#717378',
  'midnight blue': '#191970',
  'natural': '#F5F5DC',
  'walnut': '#5C4033',
  'oak': '#B8860B',
  'cotton': '#F5F5F5',
  'cotton blend': '#E8E8E8'
}

/**
 * Get hex code for a color name
 * Falls back to a default color if not found
 */
const getColorHex = (colorName: string): string => {
  const normalizedColor = colorName.toLowerCase().trim();
  // Try exact match first
  if (colorMap[normalizedColor]) {
    return colorMap[normalizedColor];
  }
  
  // Try partial match
  const matchingColor = Object.keys(colorMap).find(color => 
    normalizedColor.includes(color) || color.includes(normalizedColor)
  );
  
  return matchingColor ? colorMap[matchingColor] : '#888888'; // Default gray as fallback
}

interface ProductImage {
  id: number
  imageUrl: string
  isMain: boolean
}

interface ProductVariation {
  id: number
  name: string
  value: string
}

interface ProductVariationCombination {
  id: number
  variationId1: number
  variationId2: number | null
  variationId3: number | null
  price: number
  offerPrice: number | null
  offerExpiry: Date | null
  stockQuantity: number
  imageUrl: string | null
}

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  offerPrice: number | null
  offerExpiry: string | null
  imageUrl: string | null
  mainImage: string
  stockQuantity: number
  inventory: {
    quantity: number
  }
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
    products?: {
      id: number
      name: string
      mainImage: string
      price: number
      avgRating?: number
      reviewCount?: number
    }[]
  }
  brand: {
    id: number
    name: string
  }
  warranty: {
    id: number
    name: string
    duration: number
    description: string | null
  } | null
  sku: string
  specifications: {
    name: string
    value: string
  }[]
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
  combinations: ProductVariationCombination[]
  images: ProductImage[]
  hasVariations: boolean
  weight: number
  length: number
  width: number
  height: number
}

interface Question {
  id: string
  question: string
  isAnswered: boolean
  createdAt: string
  user: {
    name: string | null
  } | null
  answer: {
    id: string
    answer: string
    createdAt: string
    user: {
      name: string
    }
  } | null
}

interface Review {
  id: number
  rating: number
  comment: string
  reviewDate?: string
  date?: string
  status?: string
  user: {
    id?: number
    name?: string
    fullName?: string
  }
}

// Helper function to convert Decimal to number
const convertDecimalToNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (value?.toString) return Number(value.toString());
  return 0;
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({})
  const [variationStock, setVariationStock] = useState<number | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewFormData, setReviewFormData] = useState({ rating: 5, comment: '' })
  const [reviewFormError, setReviewFormError] = useState<string | null>(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [currentUser, setCurrentUser] = useState<number | null>(null)
  // Add countdown timer state
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 18,
    minutes: 45,
    seconds: 12
  })
  // Add state for reward rules
  const [rewardRules, setRewardRules] = useState([
    { min_quantity: 1, max_quantity: 2, points_per_unit: 5, bonus_points: 0, is_percentage: false, percentage_multiplier: 1 },
    { min_quantity: 3, max_quantity: 9, points_per_unit: 5, bonus_points: 15, is_percentage: false, percentage_multiplier: 1 },
    { min_quantity: 10, max_quantity: null, points_per_unit: 5, bonus_points: 25, is_percentage: false, percentage_multiplier: 1 }
  ])
  const { formatPrice } = useCurrency()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }
        const data = await response.json()
        
        // No longer fetching ratings for related products
        setProduct(data)
        setLoading(false)

        // Set initial selected image
        setSelectedImage(data.mainImage)

        // Initialize variations if they exist
        if (data.variations && data.variations.length > 0) {
          // Set initial variation stock
          setVariationStock(data.combinations[0]?.stockQuantity || 0)
          
          // Set initial selected variations
          const initialVariations: Record<string, string> = {}
          data.variations.forEach((variation: ProductVariation) => {
            initialVariations[variation.name] = variation.value
          })
          setSelectedVariations(initialVariations)
        } else {
          // For products without variations, use inventory quantity
          // Handle when inventory is an array
          const inventoryQuantity = Array.isArray(data.inventory) 
            ? data.inventory[0]?.quantity || 0
            : data.inventory?.quantity || 0
          setVariationStock(inventoryQuantity)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Failed to load product')
        setLoading(false)
      }
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}/questions`)
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }
        const data = await response.json()
        setQuestions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching questions:', error)
        setQuestions([])
      }
    }

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}/reviews`)
        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }
        const data = await response.json()
        console.log('Fetched reviews:', data)
        setReviews(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
      }
    }

    const fetchRewardRules = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}/rewards`)
        if (!response.ok) {
          throw new Error('Failed to fetch reward rules')
        }
        const data = await response.json()
        console.log('Fetched reward rules:', data)
        if (Array.isArray(data)) {
          setRewardRules(data)
        }
      } catch (error) {
        console.error('Error fetching reward rules:', error)
        // Keep default reward rules if fetch fails
      }
    }

    if (params.id) {
      fetchProduct()
      fetchQuestions()
      fetchReviews()
      fetchRewardRules()
    }
  }, [params.id])

  useEffect(() => {
    // Check if user is logged in
    const checkUserSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          if (data.userId) {
            setCurrentUser(data.userId)
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error)
      }
    }
    
    checkUserSession()
  }, [])

  // Check if user has already reviewed this product
  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const userReview = reviews.find(review => review.user?.id === currentUser)
      if (userReview) {
        // Pre-populate form with existing review data
        setReviewFormData({
          rating: userReview.rating,
          comment: userReview.comment
        })
      }
    }
  }, [currentUser, reviews])

  // Add countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        // Update seconds
        seconds -= 1;
        
        // Handle time overflow
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        
        if (hours < 0) {
          hours = 23;
          days -= 1;
        }
        
        // Reset timer when it reaches 0
        if (days < 0) {
          return { days: 2, hours: 18, minutes: 45, seconds: 12 };
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    // Get correct max stock based on inventory structure
    let inventoryQuantity = 0
    
    if (product?.variations && product.variations.length > 0) {
      // For products with variations, use variationStock
      inventoryQuantity = variationStock ?? 0
    } else {
      // For products without variations
      if (Array.isArray(product?.inventory)) {
        inventoryQuantity = Number(product?.inventory[0]?.quantity || 0)
      } else {
        inventoryQuantity = Number(product?.inventory?.quantity || 0)
      }
    }
    
    if (newQuantity >= 1 && newQuantity <= inventoryQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleVariationChange = (variationName: string, value: string) => {
    setSelectedVariations(prev => {
      const newVariations = { ...prev, [variationName]: value }
      
      // Find matching combination
      const matchingCombination = product?.combinations?.find((combo: ProductVariationCombination) => {
        const variation1 = product.variations?.find(v => v.id === Number(combo.variationId1))
        const variation2 = product.variations?.find(v => v.id === Number(combo.variationId2))
        const variation3 = product.variations?.find(v => v.id === Number(combo.variationId3))

        return (
          (!variation1 || newVariations[variation1.name] === variation1.value) &&
          (!variation2 || newVariations[variation2.name] === variation2.value) &&
          (!variation3 || newVariations[variation3.name] === variation3.value)
        )
      })

      // Update stock quantity
      setVariationStock(matchingCombination?.stockQuantity || 0)

      // Reset quantity if it exceeds the new stock value
      if (quantity > (matchingCombination?.stockQuantity || 0)) {
        setQuantity(1)
      }

      // Update selected image if this is a color variation
      if (matchingCombination?.imageUrl) {
        setSelectedImage(matchingCombination.imageUrl)
      }

      return newVariations
    })
  }

  const getCurrentCombination = () => {
    if (!product?.combinations || !product?.variations) return null

    // Find matching combination based on selected variations
    return product.combinations.find((combo: ProductVariationCombination) => {
      const variation1 = product.variations?.find(v => v.id === Number(combo.variationId1))
      const variation2 = product.variations?.find(v => v.id === Number(combo.variationId2))
      const variation3 = product.variations?.find(v => v.id === Number(combo.variationId3))

      return (
        (!variation1 || selectedVariations[variation1.name] === variation1.value) &&
        (!variation2 || selectedVariations[variation2.name] === variation2.value) &&
        (!variation3 || selectedVariations[variation3.name] === variation3.value)
      )
    })
  }

  const getCurrentPrice = () => {
    const currentCombination = getCurrentCombination()
    if (currentCombination) {
      // Check if there's an active offer for the combination
      const hasActiveOffer = currentCombination.offerPrice && 
        currentCombination.offerExpiry && 
        new Date(currentCombination.offerExpiry) > new Date()
      
      return Number(hasActiveOffer ? currentCombination.offerPrice : currentCombination.price)
    }
    // Check if there's an active offer for the product
    const hasActiveProductOffer = product?.offerPrice && 
      product?.offerExpiry && 
      new Date(product.offerExpiry) > new Date()
    
    return Number(hasActiveProductOffer ? product?.offerPrice : product?.price || 0)
  }

  const getCurrentStock = () => {
    // For products with variations, use the selected combination's stock
    if (product?.variations && product.variations.length > 0) {
      const currentCombination = getCurrentCombination()
      if (currentCombination) {
        return Number(currentCombination.stockQuantity)
      }
    }
    
    // For products without variations, get inventory quantity
    // Handle when inventory is an array
    if (Array.isArray(product?.inventory)) {
      return Number(product?.inventory[0]?.quantity || 0)
    }
    
    // Otherwise use direct inventory quantity
    return Number(product?.inventory?.quantity || 0)
  }

  const handleAddToCart = () => {
    if (!product) return

    // Get the product image
    const productImage = selectedImage || product.mainImage
    
    // Create the cart item
    const cartItem = {
      id: String(product.id),
      name: product.name,
      price: getCurrentPrice(),
      quantity,
      image: productImage
    }
    
    // Add variation if selected
    if (Object.keys(selectedVariations).length > 0) {
      // Get the actual variation combination ID
      const combination = getCombinationForVariations(selectedVariations)
      
      // Combine all variations into a single string for display
      const variationName = 'Options';
      const variationValue = Object.entries(selectedVariations)
        .map(([name, value]) => `${name}: ${value}`)
        .join(', ');
      
      // Add the variation to the cart item with actual combinationId
      // @ts-ignore - Adding variation dynamically
      cartItem.variation = {
        id: combination ? combination.id : null,
        name: variationName,
        value: variationValue,
        price: getCurrentPrice() // Use the price that considers variations
      }
    }

    // Add item to cart
    addItem(cartItem)

    // Show success message
    toast.success('Added to cart')
  }

  const handleBuyNow = () => {
    if (!product) return

    // Get the product image
    const productImage = selectedImage || product.mainImage
    
    // Create the cart item
    const cartItem = {
      id: String(product.id),
      name: product.name,
      price: getCurrentPrice(),
      quantity,
      image: productImage
    }
    
    // Add variation if selected
    if (Object.keys(selectedVariations).length > 0) {
      // Get the actual variation combination ID
      const combination = getCombinationForVariations(selectedVariations)
      
      // Combine all variations into a single string for display
      const variationName = 'Options';
      const variationValue = Object.entries(selectedVariations)
        .map(([name, value]) => `${name}: ${value}`)
        .join(', ');
      
      // Add the variation to the cart item with actual combinationId
      // @ts-ignore - Adding variation dynamically
      cartItem.variation = {
        id: combination ? combination.id : null,
        name: variationName,
        value: variationValue,
        price: getCurrentPrice() // Use the price that considers variations
      }
    }

    // Add item to cart
    addItem(cartItem)

    // Navigate to checkout
    router.push('/checkout')
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return
    if (!currentUser) {
      toast.error('Please log in to submit a question')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${params.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newQuestion.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit question')
      }

      const data = await response.json()
      
      // Optimistically update the UI with the new question
      setQuestions(prev => [{
        id: data.question.id,
        question: data.question.question,
        isAnswered: false,
        createdAt: data.question.createdAt,
        user: {
          name: 'You' // Show as "You" in the UI for better user experience
        },
        answer: null
      }, ...prev])
      
      setNewQuestion('')
      toast.success('Question submitted successfully! It will be answered by our team soon.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit question. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUniqueVariations = () => {
    if (!product?.variations) return []

    // Create a map to store unique variation names and their values
    const variationMap = new Map<string, Set<string>>()

    // Process each variation
    product.variations.forEach(variation => {
      if (!variationMap.has(variation.name)) {
        variationMap.set(variation.name, new Set())
      }
      variationMap.get(variation.name)?.add(variation.value)
    })

    // Convert the map to the required format
    return Array.from(variationMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values)
    }))
  }

  const getCombinationForVariations = (variations: Record<string, string>) => {
    if (!product?.combinations || !product?.variations) return null

    return product.combinations.find((combo: ProductVariationCombination) => {
      const variation1 = product.variations.find(v => v.id === Number(combo.variationId1))
      const variation2 = product.variations.find(v => v.id === Number(combo.variationId2))
      const variation3 = product.variations.find(v => v.id === Number(combo.variationId3))

      return (
        (!variation1 || variations[variation1.name] === variation1.value) &&
        (!variation2 || variations[variation2.name] === variation2.value) &&
        (!variation3 || variations[variation3.name] === variation3.value)
      )
    })
  }

  const isVariationAvailable = (variationName: string, value: string) => {
    if (!product?.combinations || !product?.variations) return false

    // Create a temporary selection with this value
    const tempSelection = { ...selectedVariations, [variationName]: value }

    // Check if any combination exists with this selection
    return product.combinations.some((combo: ProductVariationCombination) => {
      const variation1 = product.variations.find(v => v.id === Number(combo.variationId1))
      const variation2 = product.variations.find(v => v.id === Number(combo.variationId2))
      const variation3 = product.variations.find(v => v.id === Number(combo.variationId3))

      return (
        (!variation1 || tempSelection[variation1.name] === variation1.value) &&
        (!variation2 || tempSelection[variation2.name] === variation2.value) &&
        (!variation3 || tempSelection[variation3.name] === variation3.value) &&
        combo.stockQuantity > 0
      )
    })
  }

  const getBreadcrumbs = () => {
    if (!product) return []
    
    const breadcrumbs = [
      { name: 'Home', href: '/' },
      { name: 'Products', href: '/products' }
    ]

    if (product.category) {
      if (product.category.parentCategory) {
        breadcrumbs.push({
          name: product.category.parentCategory.name,
          href: `/category/${product.category.parentCategory.slug}`
        })
      }
      breadcrumbs.push({
        name: product.category.name,
        href: `/category/${product.category.slug}`
      })
    }

    breadcrumbs.push({
      name: product.name,
      href: `/product/${product.id}`
    })

    return breadcrumbs
  }

  const getAvailableCombinations = () => {
    if (!product?.combinations || !product?.variations) return []

    // Get the current combination's variations
    const currentVariations = Object.entries(selectedVariations).map(([name, value]) => {
      const variation = product.variations.find(v => v.name === name && v.value === value)
      return variation
    }).filter(Boolean)

    // Get other combinations that share at least one variation with the current selection
    return product.combinations.filter(combo => {
      const comboVariations = [
        product.variations.find(v => v.id === combo.variationId1),
        product.variations.find(v => v.id === combo.variationId2),
        product.variations.find(v => v.id === combo.variationId3)
      ].filter(Boolean)

      // Check if this combination shares any variations with current selection
      const hasSharedVariation = currentVariations.some(currentVar =>
        comboVariations.some(comboVar => 
          currentVar?.name === comboVar?.name && 
          currentVar?.value !== comboVar?.value
        )
      )

      return hasSharedVariation && combo.stockQuantity > 0
    })
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewFormError(null)
    setIsSubmittingReview(true)
    
    try {
      const response = await fetch(`/api/products/${params.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewFormData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit review')
      }
      
      const newReview = await response.json()
      console.log('Submitted review response:', newReview)
      
      // Update reviews list with the new review
      setReviews(prevReviews => {
        // If user already submitted a review, replace it
        const existingReviewIndex = prevReviews.findIndex(r => r.id === newReview.id)
        if (existingReviewIndex !== -1) {
          const updatedReviews = [...prevReviews]
          updatedReviews[existingReviewIndex] = newReview
          return updatedReviews
        }
        // Otherwise add the new review at the beginning
        return [newReview, ...prevReviews]
      })
      
      // Reset form and hide it
      setReviewFormData({ rating: 5, comment: '' })
      setShowReviewForm(false)
      
      toast.success('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      setReviewFormError(error instanceof Error ? error.message : 'Failed to submit review')
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4">
        {/* Skeleton loading state */}
        <div className="h-6 w-48 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          <div className="lg:col-span-10">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3">
              {/* Product Image Skeleton */}
              <div className="space-y-3">
                <div className="aspect-square max-w-[500px] w-full bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-4 gap-1 max-w-[500px]">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
                  ))}
                </div>
              </div>
              
              {/* Product Info Skeleton */}
              <div className="space-y-3 pt-4 md:pt-0">
                <div className="space-y-2">
                  <div className="h-8 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                
                <div className="h-56 w-full bg-gray-200 rounded-md animate-pulse"></div>
                
                <div className="space-y-2">
                  <div className="h-10 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Tabs Skeleton */}
            <div className="mt-8">
              <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse mb-4"></div>
              
              {/* Reviews Skeleton */}
              <div className="space-y-4 mt-4">
                <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                
                {/* Example Review Items */}
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-md space-y-2">
                    <div className="flex justify-between">
                      <div className="h-5 w-36 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="h-5 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                    <div className="h-16 w-full bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-5 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              {/* Questions Skeleton */}
              <div className="space-y-4 mt-8">
                <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                
                {/* Example Question Items */}
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-md space-y-3">
                    <div className="h-6 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-4 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-16 w-full bg-gray-200 rounded-md animate-pulse mt-2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 w-full bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-40 w-full bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <p className="text-destructive">{error || 'Product not found'}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const discount = product.price && product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 mb-2 text-sm">
        {getBreadcrumbs().map((crumb, index: number) => (
          <React.Fragment key={index}>
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {crumb.name}
            </Link>
            {index < getBreadcrumbs().length - 1 && (
              <span className="text-muted-foreground">/</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Product Details - Left Column */}
        <div className="lg:col-span-10">
          {product && (
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3">
              {/* Product Images */}
              <div className="space-y-3 px-0 md:pr-0">
                <div className="relative aspect-square max-w-[500px] w-full mx-auto md:mx-0 shadow-sm">
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover rounded-lg"
                    quality={90}
                    priority
                  />
                </div>
                {/* Product Images Thumbnails */}
                {product.images && product.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-1 max-w-[500px] mx-auto md:mx-0">
                    {product.images.map((image: ProductImage, index: number) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(image.imageUrl)}
                        className={`relative aspect-square rounded-lg overflow-hidden ${
                          selectedImage === image.imageUrl ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <Image
                          src={image.imageUrl}
                          alt={`${product.name} - ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Variation Thumbnails */}
                {product.hasVariations && product.combinations && product.combinations.length > 0 && (
                  <div className="mt-3 max-w-[500px] mx-auto md:mx-0">
                    <h3 className="text-sm font-medium mb-2">Variation Previews</h3>
                    <div className="grid grid-cols-5 gap-1">
                      {product.combinations
                        .filter(combo => combo.imageUrl) // Only show combinations with images
                        // Use a Set to track already added image URLs to prevent duplicates
                        .filter((combo, index, self) => 
                          index === self.findIndex(c => c.imageUrl === combo.imageUrl)
                        )
                        .slice(0, 10) // Limit to 10 thumbnails
                        .map((combo: ProductVariationCombination, index: number) => {
                          // Get variation details
                          const variation1 = product.variations?.find(v => v.id === Number(combo.variationId1))
                          const variation2 = product.variations?.find(v => v.id === Number(combo.variationId2))
                          const variation3 = product.variations?.find(v => v.id === Number(combo.variationId3))
                          
                          // Construct variation label
                          const variationName = [
                            variation1 ? `${variation1.value}` : '',
                            variation2 ? `${variation2.value}` : '',
                            variation3 ? `${variation3.value}` : ''
                          ].filter(Boolean).join(' / ');
                          
                          const isSelected = selectedImage === combo.imageUrl;
                          
                          return (
                            <button
                              key={combo.id}
                              onClick={() => {
                                // Update selected image
                                setSelectedImage(combo.imageUrl || product.mainImage);
                                
                                // Update selected variations
                                const newVariations: Record<string, string> = {};
                                if (variation1) newVariations[variation1.name] = variation1.value;
                                if (variation2) newVariations[variation2.name] = variation2.value;
                                if (variation3) newVariations[variation3.name] = variation3.value;
                                setSelectedVariations(newVariations);
                                
                                // Update stock
                                setVariationStock(combo.stockQuantity || 0);
                                
                                // Reset quantity if needed
                                if (quantity > (combo.stockQuantity || 0)) {
                                  setQuantity(1);
                                }
                              }}
                              className={`relative border rounded-md overflow-hidden p-0.5 ${
                                isSelected ? 'ring-2 ring-primary border-primary' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              title={variationName}
                            >
                              <div className="aspect-square relative">
                                <Image
                                  src={combo.imageUrl || product.mainImage}
                                  alt={variationName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="text-[8px] truncate text-center mt-1 font-medium">
                                {variationName}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3 md:pl-0 pt-4 md:pt-0">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">{product.name}</h1>
                  <button 
                    onClick={() => {
                      const reviewsTab = document.querySelector('[value="reviews"]') as HTMLElement;
                      if (reviewsTab) {
                        reviewsTab.click();
                      }
                    }}
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="flex text-yellow-400">
                      {(() => {
                        // Get only approved reviews for public average rating
                        const approvedReviews = reviews.filter(r => r.status === 'approved');
                        
                        // Calculate average rating
                        const avgRating = approvedReviews.length 
                          ? approvedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / approvedReviews.length
                          : 0;
                        
                        return [...Array(5)].map((_, index) => {
                          const fillValue = Math.min(Math.max(avgRating - index, 0), 1);
                          
                          // For partial stars, we're using full stars for simplicity
                          return fillValue >= 0.5 
                            ? <RiStarFill key={`star-${index}`} className="h-4 w-4" />
                            : <RiStarLine key={`star-${index}`} className="h-4 w-4" />;
                        });
                      })()}
                    </div>
                    <span>
                      {(() => {
                        // Get only approved reviews for public average rating
                        const approvedReviews = reviews.filter(r => r.status === 'approved');
                        return approvedReviews.length > 0 
                          ? `${(approvedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / approvedReviews.length).toFixed(1)} (${approvedReviews.length} ${approvedReviews.length === 1 ? 'review' : 'reviews'})`
                          : 'No reviews yet';
                      })()}
                    </span>
                  </button>
                </div>
                
                {/* Variations */}
                {product.variations && product.variations.length > 0 && (
                  <div className="space-y-2">
                    {getUniqueVariations().map(variation => {
                      const isColorVariation = variation.name.toLowerCase().includes('color')
                      return (
                        <div key={variation.name} className="space-y-1">
                          <h3 className="font-medium text-sm">{variation.name}</h3>
                          <div className="flex flex-wrap gap-1">
                            {variation.values.map(value => {
                              const tempVariations = { ...selectedVariations, [variation.name]: value }
                              const combination = getCombinationForVariations(tempVariations)
                              const isAvailable = combination && combination.stockQuantity > 0
                              const colorHex = isColorVariation ? getColorHex(value) : null

                              return (
                                <button
                                  key={value}
                                  onClick={() => handleVariationChange(variation.name, value)}
                                  disabled={!isAvailable}
                                  className={`relative group ${
                                    isColorVariation 
                                      ? 'w-24 h-7 rounded-md border p-1 flex items-center justify-center text-xs font-medium' 
                                      : 'px-3 py-1.5 text-sm font-medium border rounded-md'
                                  } transition-colors ${
                                    selectedVariations[variation.name] === value
                                      ? isColorVariation
                                        ? 'border-primary bg-primary/5'
                                        : 'bg-primary text-primary-foreground border-primary'
                                      : isColorVariation
                                        ? 'border-input hover:border-primary/50'
                                        : 'bg-background hover:bg-muted/50 border-input'
                                  } ${
                                    !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {isColorVariation ? (
                                    <>
                                      <div 
                                        className="w-3 h-3 rounded-sm mr-1.5"
                                        style={{ backgroundColor: colorHex || '#888888' }}
                                      />
                                      <span>{value}</span>
                                    </>
                                  ) : (
                                    value
                                  )}
                                  {!isAvailable && (
                                    <div className="absolute inset-0 bg-background/50 rounded-md" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Price Display */}
                <div className="flex items-center space-x-2">
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(getCurrentPrice())}
                  </p>
                  {(() => {
                    const currentCombination = getCurrentCombination()
                    const hasActiveCombinationOffer = currentCombination?.offerPrice && 
                      currentCombination?.offerExpiry && 
                      new Date(currentCombination.offerExpiry) > new Date()
                    
                    const hasActiveProductOffer = product?.offerPrice && 
                      product?.offerExpiry && 
                      new Date(product.offerExpiry) > new Date()
                    
                    if ((hasActiveProductOffer && !currentCombination) || 
                        (hasActiveCombinationOffer && currentCombination?.price > currentCombination?.offerPrice!)) {
                      const originalPrice = currentCombination?.price || product?.price
                      return (
                        <p className="text-base text-muted-foreground line-through">
                          {formatPrice(Number(originalPrice || 0))}
                        </p>
                      )
                    }
                    return null
                  })()}
                </div>

                {/* SKU and Stock Status */}
                <div className="grid grid-cols-2 gap-2">
                  {/* First Row */}
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">SKU:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {product.sku}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">Stock:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                      getCurrentStock() > 10 ? 'bg-green-100 text-green-800' :
                      getCurrentStock() > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getCurrentStock() > 10 ? 'In Stock' :
                       getCurrentStock() > 0 ? `${getCurrentStock()} left` :
                       'Out of Stock'}
                    </span>
                    {(() => {
                      const combination = getCurrentCombination()
                      // Only show additional stock info for products with variations
                      if (!combination || !product?.variations?.length) return null;
                      
                      return (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                          combination.stockQuantity > 10 ? 'bg-green-100 text-green-800' :
                          combination.stockQuantity > 0 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {combination.stockQuantity} units
                        </span>
                      )
                    })()}
                    {/* Show inventory quantity for products without variations */}
                    {!product?.variations?.length && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {Array.isArray(product?.inventory) 
                          ? product?.inventory[0]?.quantity || 0 
                          : product?.inventory?.quantity || 0} units in stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center space-x-2">
                  <label className="font-medium text-sm">Quantity:</label>
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className={`p-1.5 px-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${
                        quantity <= 1 ? 'text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={getCurrentStock()}
                      value={quantity}
                      onChange={(e) => {
                        const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), getCurrentStock())
                        setQuantity(value)
                      }}
                      className="w-16 text-center border-x px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= getCurrentStock()}
                      className={`p-1.5 px-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${
                        quantity >= getCurrentStock() ? 'text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Max: {getCurrentStock()} units
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={getCurrentStock() === 0}
                    className={`py-2 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                      getCurrentStock() === 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    <RiShoppingCart2Line className="h-4 w-4" />
                    <span>{getCurrentStock() === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>

                  {/* Order Now Button */}
                  <button
                    onClick={handleBuyNow}
                    disabled={getCurrentStock() === 0}
                    className={`py-2 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                      getCurrentStock() === 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <RiFlashlightLine className="h-4 w-4" />
                    <span>{getCurrentStock() === 0 ? 'Out of Stock' : 'Order Now'}</span>
                  </button>
                </div>

                {/* Reward Points Calculator */}
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-amber-800">Points you'll earn</h3>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                      Reward Points
                    </Badge>
                  </div>
                  
                  {/* Current points calculation */}
                  <div className="flex items-baseline space-x-1 mb-2">
                    <span className="text-lg font-bold text-amber-800">
                      {(() => {
                        // Find the applicable rule based on quantity
                        const applicableRule = rewardRules.find(rule => 
                          quantity >= rule.min_quantity && 
                          (rule.max_quantity === null || quantity <= rule.max_quantity)
                        ) || rewardRules[0];
                        
                        // Calculate base points
                        let basePoints = quantity * (applicableRule.points_per_unit || 5);
                        
                        // Calculate bonus or percentage multiplier
                        if (applicableRule.is_percentage && applicableRule.percentage_multiplier) {
                          // Apply percentage multiplier to base points
                          return Math.round(basePoints * Number(applicableRule.percentage_multiplier));
                        } else {
                          // Add bonus points
                          return basePoints + (applicableRule.bonus_points || 0);
                        }
                      })()}
                    </span>
                    <span className="text-xs text-amber-600">points</span>
                    {/* Tier Badge */}
                    {rewardRules.length >= 3 && quantity >= rewardRules[2]?.min_quantity ? (
                      <Badge className="ml-2 bg-amber-200 text-amber-800 border-amber-300 text-xs">
                        Gold Tier
                      </Badge>
                    ) : rewardRules.length >= 2 && quantity >= rewardRules[1]?.min_quantity ? (
                      <Badge className="ml-2 bg-amber-200 text-amber-800 border-amber-300 text-xs">
                        Silver Tier
                      </Badge>
                    ) : (
                      <Badge className="ml-2 bg-amber-200 text-amber-800 border-amber-300 text-xs">
                        Bronze Tier
                      </Badge>
                    )}
                  </div>

                  {/* Reward tiers comparison */}
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    {rewardRules.map((rule, index) => {
                      const isActive = quantity >= rule.min_quantity && 
                                      (rule.max_quantity === null || quantity <= rule.max_quantity);
                      
                      return (
                        <div 
                          key={`rule-${index}`}
                          className={`text-center p-1 rounded-md border ${
                            isActive
                              ? 'bg-white border-amber-300 ring-1 ring-amber-300' 
                              : 'bg-amber-50 border-amber-100'
                          }`}
                        >
                          <p className="text-[10px] text-amber-800 font-medium">
                            {rule.min_quantity}-{rule.max_quantity || '∞'} units
                          </p>
                          <p className="text-xs font-bold text-amber-800">
                            {rule.points_per_unit} pts/unit
                          </p>
                          <p className="text-[10px] text-amber-600">
                            {rule.is_percentage 
                              ? `${(Number(rule.percentage_multiplier) * 100).toFixed(0)}% multiplier` 
                              : rule.bonus_points > 0 
                                ? `+${rule.bonus_points} bonus pts` 
                                : 'No bonus'}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tier upgrade suggestion */}
                  {rewardRules.length >= 2 && quantity < rewardRules[1]?.min_quantity && (
                    <div className="p-1 bg-blue-50 border border-blue-100 rounded-md text-[10px] text-blue-800 flex items-center">
                      <span className="mr-1">💡</span> Add {rewardRules[1]?.min_quantity - quantity} more to reach Silver Tier for {rewardRules[1]?.bonus_points} bonus points!
                    </div>
                  )}
                  {rewardRules.length >= 3 && quantity >= rewardRules[1]?.min_quantity && quantity < rewardRules[2]?.min_quantity && (
                    <div className="p-1 bg-blue-50 border border-blue-100 rounded-md text-[10px] text-blue-800 flex items-center">
                      <span className="mr-1">🚀</span> Add {rewardRules[2]?.min_quantity - quantity} more to reach Gold Tier for {(rewardRules[2]?.bonus_points || 0) - (rewardRules[1]?.bonus_points || 0)} additional bonus points!
                    </div>
                  )}
                  {rewardRules.length >= 3 && quantity >= rewardRules[2]?.min_quantity && (
                    <div className="p-1 bg-green-50 border border-green-100 rounded-md text-[10px] text-green-800 flex items-center">
                      <span className="mr-1">🏆</span> You've reached Gold Tier! Maximum bonus points applied.
                    </div>
                  )}

                  {/* Current calculations breakdown */}
                  <div className="mt-1 text-[10px] text-amber-700 px-1">
                    <span className="font-medium">Your reward: </span>
                    {quantity} {quantity === 1 ? 'unit' : 'units'} × 
                    {(() => {
                      // Find applicable rule
                      const applicableRule = rewardRules.find(rule => 
                        quantity >= rule.min_quantity && 
                        (rule.max_quantity === null || quantity <= rule.max_quantity)
                      ) || rewardRules[0];
                      
                      const pointsPerUnit = applicableRule.points_per_unit || 5;
                      const basePoints = quantity * pointsPerUnit;
                      const bonusPoints = applicableRule.bonus_points || 0;
                      
                      return (
                        <>
                          {pointsPerUnit} points = {basePoints} base points
                          {applicableRule.is_percentage && applicableRule.percentage_multiplier ? (
                            <> × {(Number(applicableRule.percentage_multiplier) * 100).toFixed(0)}% = {Math.round(basePoints * Number(applicableRule.percentage_multiplier))} total points</>
                          ) : bonusPoints > 0 ? (
                            <> + {bonusPoints} bonus points = {basePoints + bonusPoints} total points</>
                          ) : (
                            <> = {basePoints} total points</>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Order Info & Coupons - Right Column */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="p-3">
            <h2 className="font-semibold mb-3">Happy With 😊</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <RiTruckFill className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RiShieldCheckFill className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RiCustomerServiceFill className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">24/7 Support</p>
                  <p className="text-xs text-muted-foreground">Round the clock assistance</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RiSecurePaymentFill className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Money Back</p>
                  <p className="text-xs text-muted-foreground">30-day guarantee</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Product Essentials */}
          <Card className="p-3">
            <h2 className="font-semibold mb-3 text-sm">Product Essentials</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Brand</p>
                <p className="text-sm font-medium">{product.brand?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-medium">{product.category.name}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-500">Warranty</span>
                </div>
                <span className="text-sm font-medium">
                  {product.warranty?.name || 'No warranty'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-4">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description" className="flex items-center justify-center gap-1">
              <RiFileTextLine className="h-4 w-4" />
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="specifications" 
              className="flex items-center justify-center gap-1 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <RiInformationLine className="h-4 w-4" />
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center justify-center gap-1">
              <RiStarLine className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center justify-center gap-1">
              <RiQuestionLine className="h-4 w-4" />
              Questions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-2">
            <Card className="p-3">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </Card>
          </TabsContent>
          <TabsContent value="specifications" className="mt-2">
            <Card className="p-4">
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div>
                  <h3 className="text-base font-semibold mb-3 border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {product?.sku && (
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2 bg-gray-100 px-2 py-1 text-xs font-medium">SKU</Badge>
                        <span>{product.sku}</span>
                      </div>
                    )}
                    {product?.category && (
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2 bg-gray-100 px-2 py-1 text-xs font-medium">Category</Badge>
                        <span>{product.category.name}</span>
                      </div>
                    )}
                    {product?.brand && (
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2 bg-gray-100 px-2 py-1 text-xs font-medium">Brand</Badge>
                        <span>{product.brand.name}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2 bg-gray-100 px-2 py-1 text-xs font-medium">Stock</Badge>
                      <span>{getCurrentStock()} units</span>
                    </div>
                    {product?.warranty && (
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2 bg-gray-100 px-2 py-1 text-xs font-medium">Warranty</Badge>
                        <span>{product.warranty.name} ({product.warranty.duration} months)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Specifications Section */}
                {product?.specifications && product.specifications.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold mb-3 border-b pb-2">Technical Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {product.specifications.map((spec, index) => (
                        <div key={index} className="flex items-center">
                          <Badge 
                            variant="secondary" 
                            className="mr-2 px-2 py-1 text-xs font-medium"
                            style={{ 
                              backgroundColor: `hsl(${(index * 20) % 360}, 70%, 96%)`,
                              borderColor: `hsl(${(index * 20) % 360}, 70%, 85%)`,
                              color: `hsl(${(index * 20) % 360}, 70%, 30%)`
                            }}
                          >
                            {spec.name}
                          </Badge>
                          <span>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Physical Attributes Section */}
                <div>
                  <h3 className="text-base font-semibold mb-3 border-b pb-2">Physical Attributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {product?.weight && (
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2 bg-blue-50 text-blue-700 border-blue-200 px-2 py-1 text-xs font-medium">Weight</Badge>
                        <span>{product.weight} kg</span>
                      </div>
                    )}
                    {product?.length && (
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2 bg-blue-50 text-blue-700 border-blue-200 px-2 py-1 text-xs font-medium">Length</Badge>
                        <span>{product.length} cm</span>
                      </div>
                    )}
                    {product?.width && (
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2 bg-blue-50 text-blue-700 border-blue-200 px-2 py-1 text-xs font-medium">Width</Badge>
                        <span>{product.width} cm</span>
                      </div>
                    )}
                    {product?.height && (
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2 bg-blue-50 text-blue-700 border-blue-200 px-2 py-1 text-xs font-medium">Height</Badge>
                        <span>{product.height} cm</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-2">
            {/* Total Review Count Header */}
            <div className="mb-3">
              <h2 className="text-lg font-semibold">
                {(() => {
                  const approvedReviews = reviews.filter(r => r.status === 'approved');
                  return approvedReviews.length > 0 
                    ? `${approvedReviews.length} ${approvedReviews.length === 1 ? 'Review' : 'Reviews'}`
                    : 'No Reviews Yet';
                })()}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left column: Review Stats & Chart */}
              <div className="md:col-span-1">
                <Card className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex text-yellow-400">
                      {(() => {
                        // Get only approved reviews for public average rating
                        const approvedReviews = reviews.filter(r => r.status === 'approved');
                        
                        // Calculate average rating
                        const avgRating = approvedReviews.length 
                          ? approvedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / approvedReviews.length
                          : 0;
                        
                        return [...Array(5)].map((_, index) => {
                          const fillValue = Math.min(Math.max(avgRating - index, 0), 1);
                          
                          // For partial stars, we're using full stars for simplicity
                          return fillValue >= 0.5 
                            ? <RiStarFill key={`star-${index}`} className="h-5 w-5" />
                            : <RiStarLine key={`star-${index}`} className="h-5 w-5" />;
                        });
                      })()}
                    </div>
                    <span className="text-lg font-bold">
                      {(() => {
                        // Get only approved reviews for public average rating
                        const approvedReviews = reviews.filter(r => r.status === 'approved');
                        return approvedReviews.length > 0 
                          ? `${(approvedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / approvedReviews.length).toFixed(1)}`
                          : '0.0';
                      })()}
                    </span>
                  </div>
                  
                  {/* Rating distribution */}
                  {(() => {
                    // Get only approved reviews for public statistics
                    const approvedReviews = reviews.filter(r => r.status === 'approved');
                    return approvedReviews.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = approvedReviews.filter(r => r.rating === rating).length;
                          const percentage = Math.round((count / approvedReviews.length) * 100);
                          
                          return (
                            <div key={`rating-${rating}`} className="flex items-center text-sm">
                              <span className="w-14">{rating} stars</span>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                                <div 
                                  className="bg-yellow-400 h-2.5 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No ratings yet</p>
                      </div>
                    );
                  })()}
                  
                  {/* Add a Review CTA */}
                  <div className="mt-4">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        if (currentUser) {
                          // Check if user already has a review
                          const userReview = reviews.find(review => review.user?.id === currentUser)
                          if (userReview) {
                            // Pre-populate form with existing review
                            setReviewFormData({
                              rating: userReview.rating,
                              comment: userReview.comment
                            })
                          }
                          setShowReviewForm(true)
                        } else {
                          toast.error('Please login to write a review')
                          // Optional: Redirect to login page
                          // router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
                        }
                      }}
                    >
                      <RiStarFill className="mr-2 h-4 w-4" />
                      {reviews.some(review => review.user?.id === currentUser)
                        ? 'Edit Your Review'
                        : 'Write a Review'
                      }
                    </Button>
                  </div>
                </Card>
                
                {/* Review Form */}
                {showReviewForm && (
                  <Card className="p-3 mt-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Write a Review</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Rating</label>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                              className="text-xl p-1 focus:outline-none"
                            >
                              {star <= reviewFormData.rating ? (
                                <RiStarFill className="h-6 w-6 text-yellow-400" />
                              ) : (
                                <RiStarLine className="h-6 w-6 text-yellow-400" />
                              )}
                            </button>
                          ))}
                          <span className="ml-2 text-sm">
                            {reviewFormData.rating} of 5 stars
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="review-comment" className="block text-sm font-medium">
                          Your Review
                        </label>
                        <textarea
                          id="review-comment"
                          rows={5}
                          className="w-full mt-1 rounded-md border p-2"
                          placeholder="Share your experience with this product..."
                          value={reviewFormData.comment}
                          onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                          required
                          minLength={5}
                          maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {reviewFormData.comment.length}/1000 characters
                        </p>
                      </div>
                      
                      {reviewFormError && (
                        <div className="text-sm text-destructive">
                          {reviewFormError}
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmittingReview || reviewFormData.comment.length < 5}
                      >
                        {isSubmittingReview ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </div>
                        ) : (
                          <>Submit Review</>
                        )}
                      </Button>
                    </form>
                  </Card>
                )}
              </div>
              
              {/* Right column: Reviews List */}
              <div className="md:col-span-2">
                {reviews.length === 0 ? (
                  <Card className="p-3">
                    <p className="text-center text-muted-foreground py-8">
                      No reviews yet. Be the first to review this product!
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {/* Filter display counts */}
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div>
                        <span className="font-medium">
                          Showing: {reviews.filter(r => r.status === 'approved' || r.user?.id === currentUser).length}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          {reviews.filter(r => r.status === 'pending' && r.user?.id === currentUser).length > 0 && 
                            `(${reviews.filter(r => r.status === 'pending' && r.user?.id === currentUser).length} pending)`}
                        </span>
                      </div>
                      {/* Optional: Add a filter toggle */}
                      {/* <Button variant="outline" size="sm">Show All</Button> */}
                    </div>
                  
                    {reviews.filter(r => r.status === 'approved' || r.user?.id === currentUser).map((review) => (
                      <Card key={review.id} className={`p-3 ${review.status !== 'approved' ? 'border-dashed border-amber-200' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, index) => (
                                index < review.rating 
                                  ? <RiStarFill key={`star-${index}`} className="h-4 w-4" /> 
                                  : <RiStarLine key={`star-${index}`} className="h-4 w-4" />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{review.rating}.0</span>
                          </div>
                          <div className="flex items-center">
                            {review.status === 'pending' && review.user?.id === currentUser && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mr-2">
                                Pending Approval
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {review.date ? new Date(review.date).toLocaleDateString() : 
                              (review.reviewDate ? new Date(review.reviewDate).toLocaleDateString() : 'Just now')}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground mt-2">
                            By {review.user?.name || review.user?.fullName || 'Anonymous'}
                          </p>
                          {review.status === 'pending' && review.user?.id === currentUser && (
                            <p className="text-xs text-amber-700 mt-2">
                              Your review will be visible to others after approval
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="questions" className="mt-2">
            <div className="space-y-3">
              {/* Ask Question Form */}
              <Card className="p-3">
                <h3 className="font-medium mb-2">Ask a Question</h3>
                <form onSubmit={handleSubmitQuestion} className="space-y-2">
                  <div className="space-y-1">
                    <label htmlFor="question" className="text-sm font-medium">Your Question</label>
                    <textarea
                      id="question"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full min-h-[80px] p-2 border rounded-md"
                      placeholder="Type your question here..."
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting || !newQuestion.trim()}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting your question...
                      </div>
                    ) : (
                      <>
                        <RiSendPlaneFill className="mr-2 h-4 w-4" />
                        Submit Question
                      </>
                    )}
                  </Button>
                  {error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">⚠️</div>
                        <div>{error}</div>
                      </div>
                    </div>
                  )}
                  {isSubmitting && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-600">
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">⏳</div>
                        <div>Please wait while we submit your question...</div>
                      </div>
                    </div>
                  )}
                </form>
              </Card>

              {/* Questions List */}
              <div className="space-y-2">
                <h3 className="font-medium">Questions & Answers ({questions.length})</h3>
                <Card className="p-3">
                  <div className="space-y-3">
                    {!Array.isArray(questions) || questions.length === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <p className="text-muted-foreground">
                          No questions yet. Be the first to ask a question!
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Scroll to question form
                            const questionForm = document.getElementById('question');
                            if (questionForm) {
                              questionForm.focus();
                              questionForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                        >
                          <RiSendPlaneFill className="mr-2 h-4 w-4" />
                          Ask a Question
                        </Button>
                      </div>
                    ) : (
                      questions.map((q) => (
                        <div key={q.id} className="space-y-1 hover:bg-gray-50 p-2 rounded-md transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Q
                                </Badge>
                                <p className="font-medium text-sm">{q.question}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 ml-7">
                                Asked by {q.user?.name || 'Anonymous'} • {new Date(q.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className={`pl-7 mt-2 ${
                            q.isAnswered ? 'border-l-2 border-primary/50 pl-3 ml-4' : ''
                          }`}>
                            {q.isAnswered && q.answer ? (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                    A
                                  </Badge>
                                  <p className="text-sm font-medium">Answer</p>
                                </div>
                                <p className="text-sm ml-7">{q.answer.answer}</p>
                                <p className="text-xs text-muted-foreground mt-1 ml-7">
                                  Answered by {q.answer.user.name} • {new Date(q.answer.createdAt).toLocaleDateString()}
                                </p>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
                                <div className="text-amber-500">⏳</div>
                                <p className="italic">This question is awaiting an answer from our team.</p>
                              </div>
                            )}
                          </div>
                          <Separator className="my-2" />
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {product?.category?.products
            ?.filter(relatedProduct => relatedProduct.id !== product.id) // Exclude current product
            ?.slice(0, 7)
            .map((relatedProduct) => (
            <Link 
              key={relatedProduct.id} 
              href={`/product/${relatedProduct.id}`}
              className="group"
            >
              <Card className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={relatedProduct.mainImage}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex flex-col space-y-2 mt-2">
                    <p className="font-medium text-sm">
                      {formatPrice(Number(relatedProduct.price || 0))}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Share Product Modal */}
      {product && (
        <ShareProductModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          product={{
            name: product.name,
            price: product.price,
            image: product.mainImage || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0].imageUrl : "/images/placeholder.png"),
            url: window.location.href
          }}
        />
      )}
    </div>
  )
} 