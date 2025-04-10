'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

interface RewardTransaction {
  id: number
  date: string
  points: number
  type: 'EARNED' | 'REDEEMED'
  description: string
}

export default function RewardsPage() {
  const [rewardPoints, setRewardPoints] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<RewardTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRewardData = async () => {
      try {
        setLoading(true)
        // API endpoint to fetch reward data will be implemented later
        // For now, just simulate loading
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching reward data:', error)
        setLoading(false)
      }
    }

    fetchRewardData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-36" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col items-center p-6 border rounded-lg">
              <Skeleton className="h-16 w-16 rounded-full mb-3" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Rewards</CardTitle>
        <CardDescription>Track and redeem your reward points</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center p-6 border rounded-lg bg-primary/5">
            <div className="p-4 bg-primary rounded-full mb-3">
              <Star className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {rewardPoints !== null ? rewardPoints : 0} Points
            </h3>
            <p className="text-sm text-muted-foreground">
              Earn points with every purchase and redeem them for discounts
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Points History</h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-6 border rounded-lg">
                <p className="text-muted-foreground">No reward transactions found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                    <Badge
                      variant={transaction.type === 'EARNED' ? 'default' : 'secondary'}
                    >
                      {transaction.type === 'EARNED' ? '+' : '-'}{transaction.points} Points
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium mb-2">How to Earn Points</h3>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>Earn 1 point for every $1 spent on purchases</li>
              <li>Get 50 bonus points when you refer a friend</li>
              <li>Earn 25 points for writing a product review</li>
              <li>100 points = $5 discount on your next order</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 