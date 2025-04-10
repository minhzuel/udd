'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, AlertCircle, Edit, Trash2, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

type Product = {
  product_id?: number
  id?: number
  name: string
  slug: string
  main_image?: string
  mainImage?: string
}

type Review = {
  id: number
  userId: number
  productId: number
  rating: number
  comment: string
  reviewDate: string
  status: 'pending' | 'approved' | 'rejected'
  product: Product
}

export default function ReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/account/profile')
        if (response.ok) {
          setIsAuthenticated(true)
          fetchReviews()
        } else {
          setIsAuthenticated(false)
          router.push('/login')
        }
      } catch (err) {
        console.error('Error checking auth:', err)
        setIsAuthenticated(false)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/account/reviews')
      
      if (!response.ok) {
        throw new Error('Failed to load reviews')
      }
      
      const data = await response.json()
      setReviews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching reviews:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
        <div className="grid gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        My Reviews
      </h1>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">You haven't reviewed any products yet.</p>
            <p className="mt-2">
              <Link href="/products" className="text-primary hover:underline">
                Browse products to leave a review
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image and Name */}
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <Image
                        src={review.product.main_image || review.product.mainImage || '/placeholder-product.png'}
                        alt={review.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        <Link 
                          href={`/product/${review.product.slug}`}
                          className="hover:underline"
                        >
                          {review.product.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">
                          {review.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.reviewDate)}
                        </span>
                        {getStatusBadge(review.status)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Review Content */}
                  <div className="flex-1 mt-2 md:mt-0">
                    <div className="text-sm bg-secondary/50 p-4 rounded-md">
                      {review.comment}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        asChild
                      >
                        <Link href={`/product/${review.product.slug}?editReview=true`}>
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 