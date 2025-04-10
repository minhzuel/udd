import { AddToCartButton } from '@/components/ui/add-to-cart-button'
import { cn } from '@/lib/utils'
import { RiShoppingCart2Line } from '@remixicon/react'

interface AddButtonProps {
  id: string
  name: string
  price: number
  image: string
  variations?: any[]
  className?: string
}

export function AddButton({ id, name, price, image, variations = [], className }: AddButtonProps) {
  return (
    <AddToCartButton
      id={id}
      name={name}
      price={price}
      image={image}
      variations={variations}
      className={cn(
        "flex-1 h-7 text-xs px-2",
        className
      )}
    >
      <RiShoppingCart2Line className="h-3.5 w-3.5 mr-1.5" />
      {variations && variations.length > 0 ? 'Options' : 'Add'}
    </AddToCartButton>
  )
} 