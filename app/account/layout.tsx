'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  AlertCircle, 
  Home, 
  Package, 
  User, 
  MapPin, 
  Award, 
  Wallet, 
  Settings, 
  LogOut,
  MessageSquare,
  HelpCircle,
  MessagesSquare
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

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

interface MenuItem {
  name: string
  path: string
  icon: React.ReactNode
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/account', icon: <Home size={18} /> },
    { name: 'Orders', path: '/account/orders', icon: <Package size={18} /> },
    { name: 'Reviews', path: '/account/reviews', icon: <MessageSquare size={18} /> },
    { name: 'Questions', path: '/account/questions', icon: <HelpCircle size={18} /> },
    { name: 'Chat Support', path: '/account/chat', icon: <MessagesSquare size={18} /> },
    { name: 'Profile', path: '/account/profile', icon: <User size={18} /> },
    { name: 'Address', path: '/account/address', icon: <MapPin size={18} /> },
    { name: 'Reward Points', path: '/account/reward-points', icon: <Award size={18} /> },
    { name: 'Wallet', path: '/account/wallet', icon: <Wallet size={18} /> },
    { name: 'Settings', path: '/account/settings', icon: <Settings size={18} /> },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/account/profile')
        
        if (response.status === 401) {
          // Unauthorized - redirect to login
          toast({
            variant: 'destructive',
            title: 'Not authenticated',
            description: 'Please login to access your account',
          })
          router.push('/login')
          return
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to load profile')
        }
        
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('Profile fetch error:', error)
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, toast])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to logout')
      }

      toast({
        title: 'Success',
        description: 'Logged out successfully',
      })

      router.push('/login')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to logout',
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-4" />
                <div className="space-y-2">
                  {Array(7).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-full md:w-3/4">
            <Card>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/4">
          <Card className="sticky top-20 h-full">
            <CardContent className="p-4">
              <div className="flex flex-col items-center mb-6 mt-4">
                <Avatar className="h-20 w-20 mb-2">
                  <AvatarImage src={user.profilePhotoUrl || undefined} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === item.path ? 
                        "bg-primary text-primary-foreground" : 
                        "hover:bg-accent"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Content */}
        <div className="w-full md:w-3/4">
          {children}
        </div>
      </div>
    </div>
  )
} 