'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { formatDate, formatPrice } from '@/lib/utils'
import { AlertCircle, Award, CalendarIcon, ChevronRight, Clock, DollarSign, Package, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type RewardPointDetail = {
  id: number
  rewardPointId: number
  orderItemId?: number | null
  productId?: number | null
  ruleId?: number | null
  points: number
  description: string
  product?: {
    id: number
    name: string
    mainImage: string
  } | null
  orderItem?: {
    id: number
    quantity: number
    itemPrice: string | number
  } | null
  rule?: {
    id: number
    name: string
    description: string
  } | null
}

type RewardPoint = {
  id: number
  userId: number
  points: number
  earnedDate: string
  expiryDate: string
  orderId?: number | null
  isUsed: boolean
  details?: RewardPointDetail[]
  order?: {
    id: number
    orderNumber?: string
    orderDate: string
    totalAmount: string | number
  } | null
}

type RewardPointsData = {
  availablePoints: number
  history: RewardPoint[]
}

export default function RewardPointsPage() {
  const router = useRouter()
  const [rewardPoints, setRewardPoints] = useState<RewardPointsData | null>(null)
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
          fetchRewardPoints()
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

  const fetchRewardPoints = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/account/reward-points')
      
      if (!response.ok) {
        throw new Error('Failed to load reward points')
      }
      
      const data = await response.json()
      setRewardPoints(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching reward points:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Group reward points by month and year
  const groupedHistory = rewardPoints?.history.reduce((groups, point) => {
    const date = new Date(point.earnedDate)
    const month = date.getMonth()
    const year = date.getFullYear()
    const key = `${year}-${month}`
    
    if (!groups[key]) {
      groups[key] = {
        month,
        year,
        label: new Date(year, month).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }),
        points: []
      }
    }
    
    groups[key].points.push(point)
    return groups
  }, {} as Record<string, {
    month: number
    year: number
    label: string
    points: RewardPoint[]
  }>) || {}
  
  // Convert to array and sort by date (newest first)
  const monthlyGroups = Object.values(groupedHistory).sort((a, b) => {
    return b.year - a.year || b.month - a.month
  })

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Reward Points</h1>
        <div className="grid gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Award className="h-6 w-6 text-primary" />
        Reward Points
      </h1>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Points</CardTitle>
            <CardDescription>Points you can redeem on your next purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold">{rewardPoints?.availablePoints || 0}</span>
              <Badge variant="outline" className="text-sm">points</Badge>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <p>Every 100 points = RM1 discount</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Earn Points</CardTitle>
            <CardDescription>Ways to earn more reward points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <ShoppingBag className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Make a Purchase</p>
                <p className="text-sm text-muted-foreground">Earn 1 point for every RM1 spent</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Buy Featured Products</p>
                <p className="text-sm text-muted-foreground">Get bonus points on selected products</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Points History</h2>
        
        {rewardPoints?.history.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">You haven't earned any reward points yet.</p>
              <p className="mt-2">
                <Link href="/products" className="text-primary hover:underline">
                  Start shopping to earn rewards
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="earned">Points Earned</TabsTrigger>
              <TabsTrigger value="redeemed">Points Redeemed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {monthlyGroups.map(group => (
                <div key={`${group.year}-${group.month}`} className="mb-8">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {group.label}
                  </h3>
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.points.map(point => (
                          <TableRow key={point.id}>
                            <TableCell className="whitespace-nowrap">
                              {formatDate(new Date(point.earnedDate))}
                            </TableCell>
                            <TableCell>
                              {point.orderId ? (
                                <div>
                                  <Link 
                                    href={`/account/orders/${point.orderId}`}
                                    className="font-medium hover:underline flex items-center gap-1"
                                  >
                                    Order #{point.order?.orderNumber || point.orderId}
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                  <p className="text-sm text-muted-foreground">
                                    {point.points > 0 
                                      ? 'Points earned from purchase' 
                                      : 'Points redeemed for discount'}
                                  </p>
                                </div>
                              ) : (
                                point.details?.[0]?.description || 'Reward Points Transaction'
                              )}
                            </TableCell>
                            <TableCell className={point.points > 0 ? 'text-green-600' : 'text-red-600'}>
                              {point.points > 0 ? '+' : ''}{point.points}
                            </TableCell>
                            <TableCell>
                              {point.isUsed ? (
                                <Badge variant="outline" className="bg-muted">Used</Badge>
                              ) : new Date(point.expiryDate) < new Date() ? (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive">Expired</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-primary/10 text-primary">Active</Badge>
                              )}
                              {!point.isUsed && new Date(point.expiryDate) >= new Date() && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Expires {formatDate(new Date(point.expiryDate))}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="earned">
              {monthlyGroups.map(group => {
                const earnedPoints = group.points.filter(p => p.points > 0);
                if (earnedPoints.length === 0) return null;
                
                return (
                  <div key={`earned-${group.year}-${group.month}`} className="mb-8">
                    <h3 className="text-lg font-medium mb-3">{group.label}</h3>
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {earnedPoints.map(point => (
                            <TableRow key={`earned-${point.id}`}>
                              <TableCell className="whitespace-nowrap">
                                {formatDate(new Date(point.earnedDate))}
                              </TableCell>
                              <TableCell>
                                {point.orderId && (
                                  <Link 
                                    href={`/account/orders/${point.orderId}`}
                                    className="font-medium hover:underline flex items-center gap-1"
                                  >
                                    Order #{point.order?.orderNumber || point.orderId}
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  Total: {formatPrice(Number(point.order?.totalAmount || 0))}
                                </p>
                              </TableCell>
                              <TableCell className="text-green-600">
                                +{point.points}
                              </TableCell>
                              <TableCell>
                                {point.isUsed ? (
                                  <Badge variant="outline" className="bg-muted">Used</Badge>
                                ) : new Date(point.expiryDate) < new Date() ? (
                                  <Badge variant="outline" className="bg-destructive/10 text-destructive">Expired</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-primary/10 text-primary">Active</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                );
              })}
            </TabsContent>
            
            <TabsContent value="redeemed">
              {monthlyGroups.map(group => {
                const redeemedPoints = group.points.filter(p => p.points < 0);
                if (redeemedPoints.length === 0) return null;
                
                return (
                  <div key={`redeemed-${group.year}-${group.month}`} className="mb-8">
                    <h3 className="text-lg font-medium mb-3">{group.label}</h3>
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Points</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {redeemedPoints.map(point => (
                            <TableRow key={`redeemed-${point.id}`}>
                              <TableCell className="whitespace-nowrap">
                                {formatDate(new Date(point.earnedDate))}
                              </TableCell>
                              <TableCell>
                                {point.orderId && (
                                  <Link 
                                    href={`/account/orders/${point.orderId}`}
                                    className="font-medium hover:underline flex items-center gap-1"
                                  >
                                    Order #{point.order?.orderNumber || point.orderId}
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {point.details?.[0]?.description || 'Points redeemed for discount'}
                                </p>
                              </TableCell>
                              <TableCell className="text-red-600">
                                {point.points}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
} 