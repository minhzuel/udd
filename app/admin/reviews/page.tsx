'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  RiCheckLine, 
  RiCloseLine, 
  RiEyeLine, 
  RiFilterLine, 
  RiStarFill, 
  RiStarLine 
} from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Review {
  id: number
  rating: number
  comment: string
  reviewDate: string
  status: string
  user: {
    id: number
    fullName: string
  }
  product: {
    id: number
    name: string
  }
}

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchReviews()
  }, [activeTab])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reviews?status=${activeTab}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const updateReviewStatus = async (reviewId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update review status')
      }
      
      // Update the local state
      setReviews(prevReviews => 
        prevReviews.filter(review => review.id !== reviewId)
      )
      
      toast.success(`Review ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
    } catch (error) {
      console.error('Error updating review status:', error)
      toast.error('Failed to update review status')
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'approved') {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>
    } else if (status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>
    } else {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Pending</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Review Management</h1>
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {activeTab !== 'all' ? activeTab : ''} reviews found.
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map(review => (
                <Card key={review.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/product/${review.product.id}`} 
                          className="font-bold hover:text-primary"
                        >
                          {review.product.name}
                        </Link>
                        {getStatusBadge(review.status)}
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, index) => (
                            index < review.rating 
                              ? <RiStarFill key={`star-${index}`} className="h-4 w-4" /> 
                              : <RiStarLine key={`star-${index}`} className="h-4 w-4" />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.rating}</span>
                      </div>
                      
                      <p className="text-sm">{review.comment}</p>
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>By {review.user.fullName}</span>
                        <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {review.status === 'pending' && (
                      <div className="flex gap-2 self-end md:self-start">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:bg-green-50 hover:text-green-700"
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                        >
                          <RiCheckLine className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                        >
                          <RiCloseLine className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                    
                    {review.status !== 'pending' && (
                      <div className="flex gap-2 self-end md:self-start">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateReviewStatus(review.id, 'pending')}
                        >
                          Reset Status
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 