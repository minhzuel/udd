'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/app/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  id: string
  name: string
  price: number
  image: string
  variations?: any[]
  className?: string
  children?: ReactNode
}

export function AddToCartButton({
  id,
  name,
  price,
  image,
  variations = [],
  className,
  children,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const router = useRouter()
  const [isAdded, setIsAdded] = useState(false)
  const hasVariations = variations && variations.length > 0

  const handleAddToCart = () => {
    if (hasVariations) {
      // Redirect to product page if product has variations
      router.push(`/product/${id}`)
      return
    }
    
    // Add directly to cart if no variations
    addItem({ id, name, price, image, quantity: 1 })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <Button
      size="xs"
      onClick={handleAddToCart}
      className={cn(className)}
      disabled={isAdded}
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added
        </>
      ) : hasVariations ? (
        children ? children : (
          <>Options</>
        )
      ) : (
        children
      )}
    </Button>
  )
} 