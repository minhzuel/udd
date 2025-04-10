'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/app/contexts/CartContext'
import { 
  MessageSquare, 
  User, 
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileFooter() {
  const pathname = usePathname()
  const { isCartOpen } = useCart()
  
  // Hide footer on cart and checkout pages or when cart is open
  const shouldHideFooter = 
    pathname?.includes('/checkout') || 
    pathname?.includes('/cart') ||
    pathname?.includes('/payment') ||
    isCartOpen
  
  if (shouldHideFooter) {
    return null
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden w-full">
      {/* Progress Bar */}
      <div className="w-full h-1.5">
        <div className="bg-gray-300 h-full relative">
          <div className="absolute left-1/2 -translate-x-1/2 w-60 h-full bg-gray-300">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-full bg-gray-400 rounded-t"></div>
          </div>
        </div>
      </div>
      
      <nav className="flex items-center justify-between h-16 bg-background border-t shadow-lg px-8">
        {/* Chat */}
        <Link href="/account/chat" className="flex flex-col items-center justify-center p-2">
          <MessageSquare className="h-6 w-6 text-gray-700" />
          <span className="text-xs text-gray-700 mt-1 font-medium">Chat</span>
        </Link>
        
        {/* Center - Account with dark gradient */}
        <div className="relative flex flex-col items-center">
          <Link 
            href="/account"
            className="relative flex flex-col items-center"
          >
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center -mt-6", 
              "bg-gradient-to-b from-purple-600 to-purple-800 shadow-lg border border-purple-700"
            )}>
              <User className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-gray-700 mt-1 font-medium">Account</span>
          </Link>
        </div>
        
        {/* Orders */}
        <Link href="/account/orders" className="flex flex-col items-center justify-center p-2">
          <Package className="h-6 w-6 text-gray-700" />
          <span className="text-xs text-gray-700 mt-1 font-medium">Orders</span>
        </Link>
      </nav>
    </div>
  )
} 