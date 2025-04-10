'use client'

import { Button } from "@/components/ui/button"
import { RiFlashlightLine } from "@remixicon/react"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/contexts/CartContext"
import { cn } from "@/lib/utils"

interface OrderNowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg"
  productId?: string
  productName?: string
  productPrice?: number
  productImage?: string
  quantity?: number
  variations?: {
    name: string
    value: string
  }[]
}

export function OrderNowButton({
  className,
  size = "md",
  productId,
  productName,
  productPrice,
  productImage,
  quantity = 1,
  variations,
  ...props
}: OrderNowButtonProps) {
  const router = useRouter()
  const { addItem, items } = useCart()

  const handleOrderNow = () => {
    // If product details are provided, add to cart first
    if (productId && productName && productPrice) {
      // Create a combined variation description if variations exist
      const variationText = variations?.map(v => `${v.name}: ${v.value}`).join(', ')
      
      addItem({
        id: productId,
        name: productName,
        price: productPrice,
        quantity: quantity,
        image: productImage || "/brand/placeholder.png",
        variation: variations && variations.length > 0 ? {
          id: `${productId}-var`,
          name: 'Combined',
          value: variationText,
          price: undefined
        } : undefined
      })
    }
    
    // Navigate to checkout
    router.push("/checkout")
  }

  // If no product details provided, only enable if cart has items
  const isDisabled = !productId && items.length === 0

  return (
    <Button
      onClick={handleOrderNow}
      disabled={isDisabled}
      className={cn(
        "bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white",
        className
      )}
      size={size}
      {...props}
    >
      <RiFlashlightLine className="mr-2 h-4 w-4" />
      Order Now
    </Button>
  )
} 