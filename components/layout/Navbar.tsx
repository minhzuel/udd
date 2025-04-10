'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { RiShoppingCart2Line, RiUser3Line, RiSearchLine, RiSunLine, RiMoonLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="mr-8">
          <div className="relative h-10 w-[120px]">
            <Image
              src="/brand/uddog.png"
              alt="Uddog"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex flex-1 items-center justify-center max-w-3xl mx-auto px-4">
          <div className="flex h-10 w-full items-center rounded-md border bg-background px-3">
            <RiSearchLine className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
          >
            <RiSunLine className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <RiMoonLine className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <RiShoppingCart2Line className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              0
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <RiUser3Line className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
} 