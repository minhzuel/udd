'use client'

import { CartItem, useCart as useCartContext, CartProvider } from '@/app/contexts/CartContext'

// Re-export the CartItem interface and useCart hook
export { CartItem }
export const useCart = useCartContext

// Re-export the CartProvider component
export { CartProvider } 