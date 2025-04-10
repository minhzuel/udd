import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { RiFlashlightLine } from "@remixicon/react"
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/contexts/CartContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  productId?: string;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  quantity?: number;
  variations?: {
    name: string;
    value: string;
  }[];
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const AddToCartButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, productId, productName, productPrice, productImage, quantity = 1, variations, ...props }, ref) => {
    const { addItem } = useCart();

    const handleAddToCart = () => {
      if (productId && productName && productPrice) {
        const variationText = variations?.map(v => `${v.name}: ${v.value}`).join(', ');
        
        addItem({
          id: productId,
          name: productName,
          price: productPrice,
          quantity: quantity,
          image: productImage || "/brand/placeholder.png",
          variation: variations && variations.length > 0 ? {
            id: `${productId}-var`,
            name: 'Combined',
            value: variationText
          } : undefined
        });
      }
    };

    return (
      <Button
        ref={ref}
        variant="primary"
        size="sm"
        className={cn('w-full', className)}
        onClick={handleAddToCart}
        {...props}
      >
        Add
      </Button>
    );
  }
);

AddToCartButton.displayName = 'AddToCartButton';

export const OrderNowButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, productId, productName, productPrice, productImage, quantity = 1, variations, ...props }, ref) => {
    const router = useRouter();
    const { addItem } = useCart();

    const handleOrderNow = () => {
      if (productId && productName && productPrice) {
        const variationText = variations?.map(v => `${v.name}: ${v.value}`).join(', ');
        
        addItem({
          id: productId,
          name: productName,
          price: productPrice,
          quantity: quantity,
          image: productImage || "/brand/placeholder.png",
          variation: variations && variations.length > 0 ? {
            id: `${productId}-var`,
            name: 'Combined',
            value: variationText
          } : undefined
        });

        // Navigate to checkout page
        router.push('/checkout');
      }
    };

    return (
      <Button
        ref={ref}
        variant="success"
        size="sm"
        className={cn('w-full whitespace-nowrap', className)}
        onClick={handleOrderNow}
        {...props}
      >
        <RiFlashlightLine className="mr-2 h-4 w-4" />
        Order Now
      </Button>
    );
  }
);

OrderNowButton.displayName = 'OrderNowButton';

export { Button }; 