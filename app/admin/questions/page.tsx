'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  RiSearch2Line,
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiQuestionLine,
  RiRefreshLine,
  RiFilter3Line
} from '@remixicon/react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

interface Question {
  id: number
  question: string | null
  answer: string | null
  questionDate: string
  user: {
    id: number
    fullName: string
  }
  product: {
    id: number
    name: string
    mainImage: string | null
  }
}

export default function QuestionsAdminPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('unanswered')
  const [searchQuery, setSearchQuery] = useState('')
  const [answerText, setAnswerText] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchQuestions()
  }, [activeTab])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build URL with filters based on active tab
      let url = '/api/admin/questions'
      const params = new URLSearchParams()
      
      if (activeTab === 'unanswered') {
        params.append('answered', 'false')
      } else if (activeTab === 'answered') {
        params.append('answered', 'true')
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      const queryParams = params.toString()
      if (queryParams) {
        url += `?${queryParams}`
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }
      
      const data = await response.json()
      setQuestions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError('Failed to load questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchQuestions()
  }

  const handleAnswerQuestion = async (questionId: number) => {
    const answer = answerText[questionId]
    
    if (!answer || answer.trim() === '') {
      toast.error('Please enter an answer')
      return
    }
    
    try {
      setSubmitting(prev => ({ ...prev, [questionId]: true }))
      
      const response = await fetch(`/api/admin/questions/${questionId}/answer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }
      
      // Update the question in the state
      const updatedQuestion = await response.json()
      
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, answer: updatedQuestion.question.answer } : q
      ))
      
      // Clear the answer text
      setAnswerText(prev => {
        const newState = { ...prev }
        delete newState[questionId]
        return newState
      })
      
      toast.success('Answer submitted successfully')
      
      // If we're on the unanswered tab, the question should be removed
      if (activeTab === 'unanswered') {
        setQuestions(questions.filter(q => q.id !== questionId))
      }
    } catch (error) {
      console.error('Error answering question:', error)
      toast.error('Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const getQuestionStatus = (question: Question) => {
    if (question.answer) {
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary">
          <RiCheckLine className="mr-1 h-3 w-3" />
          Answered
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
        <RiQuestionLine className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    )
  }

  const renderQuestionsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <RiErrorWarningLine className="h-10 w-10 text-destructive mb-2" />
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchQuestions} 
            className="mt-4"
          >
            <RiRefreshLine className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )
    }

    if (questions.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No questions found{activeTab === 'unanswered' ? ' waiting for answers' : ''}.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Product Image and Details */}
              <div className="flex-none w-full md:w-48">
                <div className="flex gap-3 items-center">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md">
                    <Image
                      src={question.product.mainImage || '/images/placeholder.png'}
                      alt={question.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/product/${question.product.id}`}
                      className="text-sm font-medium hover:text-primary line-clamp-2"
                    >
                      {question.product.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Product ID: {question.product.id}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Question Content */}
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-base">{question.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Asked by {question.user.fullName} • {new Date(question.questionDate).toLocaleDateString()}
                      </p>
                    </div>
                    {getQuestionStatus(question)}
                  </div>
                  
                  {question.answer ? (
                    <div className="mt-2 pl-3 border-l-2 border-primary/30">
                      <p className="text-sm">{question.answer}</p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Textarea
                        placeholder="Type your answer here..."
                        value={answerText[question.id] || ''}
                        onChange={(e) => setAnswerText(prev => ({ ...prev, [question.id]: e.target.value }))}
                        className="mb-2"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleAnswerQuestion(question.id)}
                          disabled={submitting[question.id] || !answerText[question.id]?.trim()}
                        >
                          {submitting[question.id] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <RiCheckLine className="mr-2 h-4 w-4" />
                              Submit Answer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Product Questions</h1>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <RiSearch2Line className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchQuestions}
            >
              <RiRefreshLine className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="unanswered" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unanswered">
            <Badge variant="outline" className="mr-2 bg-orange-500/10 text-orange-500">
              {questions.filter(q => !q.answer).length}
            </Badge>
            Unanswered
          </TabsTrigger>
          <TabsTrigger value="answered">
            <Badge variant="outline" className="mr-2 bg-primary/10 text-primary">
              {questions.filter(q => !!q.answer).length}
            </Badge>
            Answered
          </TabsTrigger>
          <TabsTrigger value="all">
            <Badge variant="outline" className="mr-2">
              {questions.length}
            </Badge>
            All Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unanswered">
          {renderQuestionsList()}
        </TabsContent>
        
        <TabsContent value="answered">
          {renderQuestionsList()}
        </TabsContent>
        
        <TabsContent value="all">
          {renderQuestionsList()}
        </TabsContent>
      </Tabs>
    </div>
  )
} 