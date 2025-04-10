'use client'

import { useCart } from '@/app/contexts/CartContext'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { MiniCart } from './MiniCart'

export function FloatingCartButton() {
  const { totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart()
  const { formatPrice } = useCurrency()

  return (
    <>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-2">
        <div className="flex flex-col items-center">
          {totalItems > 0 && (
            <div className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-[10px] font-medium mb-2 shadow-md">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </div>
          )}
          <Button
            variant="default"
            size="lg"
            className="relative h-20 w-20 rounded-lg shadow-lg flex flex-col items-center justify-center overflow-hidden"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="flex-1 w-full flex items-center justify-center bg-background">
              <ShoppingCart className="h-7 w-7" />
            </div>
            {totalItems > 0 && (
              <div className="w-full bg-purple-900 text-white py-1.5 flex items-center justify-center">
                <div className="text-[10px] font-medium">{formatPrice(totalPrice)}</div>
              </div>
            )}
          </Button>
        </div>
      </div>
      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
} 