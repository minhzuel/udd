'use client'

import { useCart } from '@/app/contexts/CartContext'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { Button } from '@/components/ui/button'
import { ShoppingCart, X, Plus, Minus, Tag, Award, Info } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MiniCartProps {
  isOpen: boolean
  onClose: () => void
}

// Simple function to estimate reward points (following the same logic as server-side calculation)
function estimateRewardPoints(price: number, quantity: number): number {
  // Base points: 5 points per unit (matches database rule)
  const basePointsPerUnit = 5;
  let pointsEstimate = basePointsPerUnit * quantity;
  
  // Add bonus points for quantity thresholds (exact match with database rules)
  if (quantity >= 10) {
    pointsEstimate += 25; // Bonus for 10+ items
  } else if (quantity >= 3) {
    pointsEstimate += 15; // Bonus for 3-9 items
  }
  
  return pointsEstimate;
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const { formatPrice } = useCurrency()
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [rewardPoints, setRewardPoints] = useState<number | null>(null)
  const [isLoadingPoints, setIsLoadingPoints] = useState(false)

  // Fetch user's current reward points
  useEffect(() => {
    if (isOpen) {
      const fetchRewardPoints = async () => {
        try {
          setIsLoadingPoints(true)
          const response = await fetch('/api/account/reward-points')
          if (response.ok) {
            const data = await response.json()
            setRewardPoints(data.availablePoints || 0)
          }
        } catch (error) {
          console.error('Error fetching reward points:', error)
        } finally {
          setIsLoadingPoints(false)
        }
      }
      
      fetchRewardPoints()
    }
  }, [isOpen])

  // Calculate estimated total reward points for current cart
  const estimatedCartRewardPoints = items.reduce((total, item) => {
    return total + estimateRewardPoints(item.price, item.quantity)
  }, 0)
  
  // Order amount bonus: 1% of the total order amount (exact match with database rule)
  const orderBonus = Math.floor(totalPrice * 0.01);
  const totalEstimatedRewardPoints = estimatedCartRewardPoints + orderBonus

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setIsApplyingCoupon(true)
    setCouponError(null)

    try {
      // Here you would typically make an API call to validate the coupon
      // For now, we'll simulate a successful coupon application
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (couponCode.toUpperCase() === 'DEMO10') {
        setAppliedCoupon(couponCode.toUpperCase())
        setCouponError(null)
      } else {
        setCouponError('Invalid coupon code')
      }
    } catch (error) {
      setCouponError('Failed to apply coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-background shadow-lg transition-transform duration-300 ease-in-out">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {items.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const itemRewardPoints = estimateRewardPoints(item.price, item.quantity);
                  return (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-md">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)}
                        </p>
                        {item.variation && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {item.variation.name === 'Options' ? (
                              <span>{item.variation.value}</span>
                            ) : (
                              <span>
                                <span className="font-medium">{item.variation.name}:</span> {item.variation.value}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-1 flex items-center text-amber-600 text-[10px] font-medium opacity-80">
                          <Award className="h-3 w-3 mr-0.5" />
                          <span>+{itemRewardPoints} points</span>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(0, item.quantity - 1))
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rewards Summary Section */}
          {items.length > 0 && (
            <div className="border-t px-4 py-3 bg-gradient-to-br from-amber-50 to-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Rewards Summary</span>
                {rewardPoints !== null && rewardPoints > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">Current balance: {rewardPoints} points</span>
                )}
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Product rewards:</span>
                  <span className="font-medium text-amber-600">{estimatedCartRewardPoints} points</span>
                </div>
                <div className="flex justify-between">
                  <span>Order bonus (1%):</span>
                  <span className="font-medium text-amber-600">+{orderBonus} points</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-dashed border-amber-200">
                  <span className="font-medium">Total estimated:</span>
                  <span className="font-medium text-amber-600">{totalEstimatedRewardPoints} points</span>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  5 points per item + quantity bonuses. Points added after purchase.
                </div>
              </div>
            </div>
          )}

          {/* Coupon Section */}
          {items.length > 0 && (
            <div className="border-t px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Have a coupon?</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                  disabled={isApplyingCoupon || !!appliedCoupon}
                />
                {appliedCoupon ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppliedCoupon(null)
                      setCouponCode('')
                    }}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </Button>
                )}
              </div>
              {couponError && (
                <p className="text-sm text-destructive mt-2">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="text-sm text-green-600 mt-2">
                  Coupon "{appliedCoupon}" applied successfully!
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t px-4 py-4">
              <div className="mb-4 flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <Button className="w-full" asChild>
                <div onClick={onClose}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 