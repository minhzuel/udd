'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, HelpCircle, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

type Product = {
  id: number
  product_id?: number
  name: string
  slug: string
  mainImage?: string
  main_image?: string
}

type User = {
  id: number
  fullName: string
}

type Question = {
  id: number
  userId: number
  productId: number
  question: string
  answer: string | null
  questionDate: string
  product: Product
  user: User
}

export default function QuestionsPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
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
          fetchQuestions()
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

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/account/questions')
      
      if (!response.ok) {
        throw new Error('Failed to load questions')
      }
      
      const data = await response.json()
      setQuestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching questions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">My Questions</h1>
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
        <HelpCircle className="h-6 w-6 text-primary" />
        My Questions
      </h1>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">You haven't asked any questions yet.</p>
            <p className="mt-2">
              <Link href="/products" className="text-primary hover:underline">
                Browse products to ask questions
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  {/* Product and Date */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <Image
                        src={question.product.main_image || question.product.mainImage || '/placeholder-product.png'}
                        alt={question.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        <Link 
                          href={`/product/${question.product.slug}`}
                          className="hover:underline"
                        >
                          {question.product.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(question.questionDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Question */}
                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <HelpCircle className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-medium text-sm">Question</p>
                    </div>
                    <div className="pl-8 text-sm">
                      {question.question}
                    </div>
                  </div>
                  
                  {/* Answer (if exists) */}
                  {question.answer && (
                    <div>
                      <div className="flex items-start gap-2 mb-1">
                        <div className="bg-success/10 p-1.5 rounded-full">
                          <MessageCircle className="h-4 w-4 text-success" />
                        </div>
                        <p className="font-medium text-sm">Answer</p>
                      </div>
                      <div className="pl-8 text-sm">
                        {question.answer}
                      </div>
                    </div>
                  )}
                  
                  {/* View Product Button */}
                  <div className="flex justify-end mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      asChild
                    >
                      <Link href={`/product/${question.product.slug}`}>
                        <span>View Product</span>
                      </Link>
                    </Button>
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