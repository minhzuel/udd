'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  variation?: {
    id: string
    name: string
    value: string
    price?: number
  }
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  appliedCoupon: string | null
  applyCoupon: (code: string) => void
  removeCoupon: () => void
  totalPrice: number
  totalItems: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
    const savedCoupon = localStorage.getItem('appliedCoupon')
    if (savedCoupon) {
      setAppliedCoupon(savedCoupon)
    }
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isHydrated])

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      if (appliedCoupon) {
        localStorage.setItem('appliedCoupon', appliedCoupon)
      } else {
        localStorage.removeItem('appliedCoupon')
      }
    }
  }, [appliedCoupon, isHydrated])

  // Don't render children until hydration is complete
  if (!isHydrated) {
    return null
  }

  const addItem = (newItem: CartItem) => {
    setItems(currentItems => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(item => {
        // If item has variation, match both product and variation IDs
        if (newItem.variation) {
          return item.id === newItem.id && 
                 item.variation?.id === newItem.variation.id
        }
        // Otherwise, just match product ID
        return item.id === newItem.id
      })

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      }

      // Add new item to cart
      return [...currentItems, newItem]
    })
  }

  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setAppliedCoupon(null)
  }

  const applyCoupon = (code: string) => {
    setAppliedCoupon(code)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Calculate total items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        totalPrice,
        totalItems,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 