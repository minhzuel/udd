'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { 
  ShoppingCart, 
  User, 
  Search, 
  Sun, 
  Moon, 
  X, 
  LogOut, 
  Menu,
  ShoppingBag,
  Package,
  Settings,
  FileText,
  Layers,
  Tags,
  Box,
  Grid,
  CreditCard,
  Heart,
  Home,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { useCart } from '@/app/contexts/CartContext'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { MiniCart } from '@/components/cart/MiniCart'
import { FloatingCartButton } from '@/components/cart/FloatingCartButton'
import ProductCard from '@/components/product/ProductCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { CurrencySwitcher } from '@/components/currency-switcher'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

// Custom hook to check authentication status
function useAuth() {
  const [user, setUser] = useState<{ id: number; name: string; profilePhotoUrl?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/account/profile')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
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

      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to logout',
      })
    }
  }

  return { user, loading, logout }
}

// Helper to get user's initials
function getInitials(name: string): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function getCategoryIcon(title: string) {
  const normalizedTitle = title.toLowerCase();
  
  if (normalizedTitle.includes('user')) return User;
  if (normalizedTitle.includes('account')) return User;
  if (normalizedTitle.includes('shop') || normalizedTitle.includes('store')) return ShoppingBag;
  if (normalizedTitle.includes('product')) return Box;
  if (normalizedTitle.includes('categor')) return Grid;
  if (normalizedTitle.includes('system')) return Settings;
  if (normalizedTitle.includes('settings')) return Settings;
  if (normalizedTitle.includes('ecommerce')) return ShoppingBag;
  if (normalizedTitle.includes('order')) return Package;
  if (normalizedTitle.includes('payment')) return CreditCard;
  if (normalizedTitle.includes('wishlist')) return Heart;
  if (normalizedTitle.includes('home')) return Home;
  if (normalizedTitle.includes('log')) return FileText;
  if (normalizedTitle.includes('app')) return Layers;
  if (normalizedTitle.includes('document')) return FileText;
  
  // Default icon
  return Tags;
}

function getCategoryColor(title: string) {
  const normalizedTitle = title.toLowerCase();
  
  if (normalizedTitle.includes('user') || normalizedTitle.includes('account')) 
    return 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400';
  
  if (normalizedTitle.includes('shop') || normalizedTitle.includes('ecommerce') || normalizedTitle.includes('store')) 
    return 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400';
  
  if (normalizedTitle.includes('product') || normalizedTitle.includes('categor')) 
    return 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400';
  
  if (normalizedTitle.includes('system') || normalizedTitle.includes('settings')) 
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  
  if (normalizedTitle.includes('order') || normalizedTitle.includes('payment')) 
    return 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400';
  
  if (normalizedTitle.includes('wishlist') || normalizedTitle.includes('heart')) 
    return 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400';
  
  if (normalizedTitle.includes('component')) 
    return 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400';
  
  // Default color
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
}

// Category interface based on API response
interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string
  _count: {
    ecommerceProduct: number
  }
  children: Category[]
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ column1: any[], column2: any[] }>({ column1: [], column2: [] })
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const { totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart()
  const { theme, setTheme } = useTheme()
  const { user, loading, logout } = useAuth()

  // Fetch product categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Failed to fetch categories')
        }

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: Expected an array of categories')
        }

        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setCategoriesError(err instanceof Error ? err.message : 'Failed to load categories')
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }

    if (drawerOpen) {
      fetchCategories()
    }
  }, [drawerOpen])

  // Close cart when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false)
        setIsSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [setIsCartOpen])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ column1: [], column2: [] })
        return
      }

      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        setSearchResults(data)
        setIsSearchOpen(true)
      } catch (error) {
        console.error('Error searching products:', error)
      }
    }

    const timeoutId = setTimeout(fetchResults, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col">
          {/* Top bar: Burger | Logo | Cart */}
          <div className="container flex h-14 items-center justify-between">
            {/* Left: Burger Menu */}
            <div className="flex-1 flex justify-start">
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" className="size-8 p-0">
                    <Menu className="size-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[90vh] p-0 flex flex-col">
                  {/* Top Section: Profile & Currency */}
                  <div className="border-b border-border/40 p-4">
                    {/* User Account and Currency */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 max-w-[75%]">
                        {loading ? (
                          <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                        ) : user ? (
                          <>
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              {user.profilePhotoUrl ? (
                                <AvatarImage src={user.profilePhotoUrl} alt={user.name} />
                              ) : (
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              )}
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground">Account Member</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium">Guest</p>
                              <p className="text-xs text-muted-foreground">Sign in to access your account</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Currency Switcher */}
                      <div className="flex-shrink-0">
                        <CurrencySwitcher />
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Scrollable Categories */}
                  <div className="flex-1 overflow-y-auto py-2 px-0">
                    <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      Shop by Category
                    </h3>
                    
                    {categoriesLoading ? (
                      <div className="p-4 space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="h-8 w-8 rounded-md bg-muted flex-shrink-0"></div>
                            <div className="flex-1 space-y-1">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/3"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : categoriesError ? (
                      <div className="p-4 text-sm text-red-500">
                        <p>Error loading categories</p>
                      </div>
                    ) : (
                      <nav className="p-1">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="relative"
                            onClick={() => {
                              if (activeCategory === category.id) {
                                setActiveCategory(null);
                              } else {
                                setActiveCategory(category.id);
                              }
                            }}
                          >
                            <div
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer",
                                "hover:bg-accent hover:text-accent-foreground",
                                activeCategory === category.id && "bg-accent text-accent-foreground"
                              )}
                            >
                              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-md bg-background">
                                <Image
                                  src={category.image || "/categories/category.png"}
                                  alt={category.name}
                                  width={32}
                                  height={32}
                                  className="object-contain"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{category.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {category._count?.ecommerceProduct || 0} products
                                </div>
                              </div>
                              {category.children && category.children.length > 0 && (
                                <ChevronRight className={cn(
                                  "h-4 w-4 text-muted-foreground transition-transform",
                                  activeCategory === category.id && "rotate-90"
                                )} />
                              )}
                            </div>

                            {/* Subcategories */}
                            {category.children && category.children.length > 0 && activeCategory === category.id && (
                              <div className="pl-8 my-1 space-y-1 border-l ml-4">
                                {category.children.map((subCategory) => (
                                  <Link
                                    key={subCategory.id}
                                    href={`/category/${subCategory.slug}`}
                                    className="flex items-center gap-2 p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent toggling parent when clicking child
                                      setDrawerOpen(false);
                                    }}
                                  >
                                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-sm bg-background">
                                      <Image
                                        src={subCategory.image || "/categories/category.png"}
                                        alt={subCategory.name}
                                        width={24}
                                        height={24}
                                        className="object-contain"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{subCategory.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {subCategory._count?.ecommerceProduct || 0} products
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </nav>
                    )}
                  </div>

                  {/* Bottom Section: Login/Logout */}
                  <div className="border-t border-border/40 p-4">
                    {user ? (
                      <div className="flex flex-col space-y-2">
                        <Button 
                          asChild
                          variant="default" 
                          className="w-full"
                        >
                          <Link href="/account/profile">
                            <User className="h-4 w-4 mr-2" />
                            My Account
                          </Link>
                        </Button>
                        <Button 
                          onClick={logout} 
                          variant="outline" 
                          className="w-full"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="outline">
                          <Link href="/login">
                            Login
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/register">
                            Register
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/">
                <Image
                  src="/brand/uddog.png"
                  alt="Uddog"
                  width={100}
                  height={40}
                  className="h-7 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Right: Cart */}
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Button>
            </div>
          </div>

          {/* Bottom: Full-width search */}
          <div className="w-full px-4 py-2 border-t border-border/40">
            <div className="relative w-full" ref={searchRef}>
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 pr-10 h-10 rounded-full bg-muted/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                autoComplete="off"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full w-10 hover:bg-transparent"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {/* Search Results Dropdown */}
              {isSearchOpen && (searchResults.column1.length > 0 || searchResults.column2.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg p-4 z-50">
                  <div className="grid grid-cols-1 gap-2">
                    {/* Combined results for mobile */}
                    {[...searchResults.column1, ...searchResults.column2].map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="block hover:bg-accent p-2 rounded-md transition-colors"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0">
                            <Image
                              src={product.thumbnail || product.productImage?.[0]?.url || '/placeholder.png'}
                              alt={product.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {useCurrency().formatPrice(product.price)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex container h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/brand/uddog.png"
              alt="Uddog"
              width={135}
              height={50}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Search Box */}
          <div className="flex w-full max-w-2xl items-center px-4">
            <div className="relative w-full" ref={searchRef}>
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                autoComplete="off"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full w-10 hover:bg-transparent"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {/* Search Results Dropdown */}
              {isSearchOpen && (searchResults.column1.length > 0 || searchResults.column2.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Column 1 */}
                    <div className="space-y-2">
                      {searchResults.column1.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="block hover:bg-accent p-2 rounded-md transition-colors"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 flex-shrink-0">
                              <Image
                                src={product.thumbnail || product.productImage?.[0]?.url || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {useCurrency().formatPrice(product.price)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Column 2 */}
                    <div className="space-y-2">
                      {searchResults.column2.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="block hover:bg-accent p-2 rounded-md transition-colors"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 flex-shrink-0">
                              <Image
                                src={product.thumbnail || product.productImage?.[0]?.url || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {useCurrency().formatPrice(product.price)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <NavigationMenu>
            <NavigationMenuList className="flex items-center space-x-4">
              {/* Cart */}
              <NavigationMenuItem>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(true)}
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
                  <span className="sr-only">Shopping Cart</span>
                </Button>
                {totalItems > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCartOpen(true)}
                    className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {useCurrency().formatPrice(totalPrice)}
                  </Button>
                )}
              </NavigationMenuItem>

              {/* Account - Updated to check authentication status and show avatar when logged in */}
              <NavigationMenuItem>
                {loading ? (
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="p-0">
                        <Avatar className="h-9 w-9">
                          {user.profilePhotoUrl ? (
                            <AvatarImage src={user.profilePhotoUrl} alt={user.name} />
                          ) : (
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="sr-only">My Account</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/account/profile">My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/wishlist">Wishlist</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                        <span className="sr-only">My Account</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/login">Login</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register">Register</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </NavigationMenuItem>

              {/* Currency Switcher */}
              <NavigationMenuItem>
                <CurrencySwitcher />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
} 