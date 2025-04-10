'use client'

import { useEffect } from 'react'
import { useCart } from '@/app/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Home, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    // Clear the cart when the success page is shown
    clearCart()
  }, [clearCart])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <CheckCircle2 className="h-24 w-24 text-green-500" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
          <p className="text-muted-foreground text-lg">
            Your order has been successfully placed. We'll send you a confirmation email with your order details shortly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You can track your order status and view your order history in your account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
              <Button asChild className="flex items-center gap-2">
                <Link href="/orders">
                  <ShoppingBag className="h-4 w-4" />
                  View Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 