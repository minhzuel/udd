'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, Star, Award, HelpCircle } from 'lucide-react'

interface UserData {
  id: number
  name: string
  email: string | null
  mobile: string | null
  userType: string
  customerType: string | null
  roles: Array<{
    id: number
    name: string
  }>
  profilePhotoUrl?: string
}

interface DashboardStat {
  icon: React.ReactNode
  label: string
  value: number
  href: string
  gradient: string
  textColor: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStat[]>([
    { 
      icon: <Package className="h-5 w-5" />,
      label: 'Orders', 
      value: 0, 
      href: '/account/orders',
      gradient: 'from-blue-600 to-blue-900',
      textColor: 'text-blue-100'
    },
    { 
      icon: <Star className="h-5 w-5" />,
      label: 'Reviews', 
      value: 0, 
      href: '/account/reviews',
      gradient: 'from-amber-500 to-orange-700',
      textColor: 'text-amber-100'
    },
    { 
      icon: <Award className="h-5 w-5" />,
      label: 'Reward Points', 
      value: 0, 
      href: '/account/reward-points',
      gradient: 'from-purple-600 to-purple-900',
      textColor: 'text-purple-100'
    },
    { 
      icon: <HelpCircle className="h-5 w-5" />,
      label: 'Questions', 
      value: 0, 
      href: '/account/questions',
      gradient: 'from-emerald-600 to-emerald-900',
      textColor: 'text-emerald-100'
    }
  ])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch('/api/account/profile')
        
        if (response.ok) {
          const data = await response.json()
          setUser(data)
          
          // Fetch real statistics from API
          try {
            const statsResponse = await fetch('/api/account/statistics')
            if (statsResponse.ok) {
              const statsData = await statsResponse.json()
              
              setStats(prev => [
                { ...prev[0], value: statsData.orderCount || 0 }, // Orders
                { ...prev[1], value: statsData.reviewCount || 0 }, // Reviews
                { ...prev[2], value: statsData.availablePoints || 0 }, // Reward Points
                { ...prev[3], value: statsData.questionCount || 0 }, // Questions
              ])
            }
          } catch (statsError) {
            console.error('Statistics fetch error:', statsError)
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="border shadow-sm">
                <CardContent className="p-3 flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Dashboard</CardTitle>
        <CardDescription>Welcome back, {user.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Link href={stat.href} key={index}>
              <div className={`rounded-lg bg-gradient-to-br ${stat.gradient} shadow hover:shadow-md transition-shadow cursor-pointer p-3 h-full`}>
                <div className="flex items-center justify-between">
                  <div className={`${stat.textColor}`}>
                    <div className="text-sm font-medium mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </div>
                  <div className={`p-2 rounded-full bg-white/10 ${stat.textColor}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {user.email && <p><span className="font-medium">Email:</span> {user.email}</p>}
                {user.mobile && <p><span className="font-medium">Mobile:</span> {user.mobile}</p>}
                <p><span className="font-medium">Account Type:</span> {user.userType}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View your recent order history</p>
              <Button size="sm" className="mt-2" asChild>
                <Link href="/account/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shipping Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage your shipping addresses</p>
              <Button size="sm" className="mt-2" asChild>
                <Link href="/account/address">Manage Addresses</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Update your profile information</p>
              <Button size="sm" className="mt-2" asChild>
                <Link href="/account/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
} 