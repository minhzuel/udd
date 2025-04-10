'use client'

import { Award, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { CartItem } from '@/app/contexts/CartContext'

interface EstimatedRewardPointsProps {
  items: CartItem[]
  subtotal: number
}

// Calculate estimated reward points for an item
function estimateRewardPoints(quantity: number): number {
  // Base points: 5 points per unit (matches database rule)
  const basePointsPerUnit = 5;
  let pointsEstimate = basePointsPerUnit * quantity;
  
  // Add bonus points for quantity thresholds (matching database rules)
  if (quantity >= 10) {
    pointsEstimate += 25; // Bonus for 10+ items
  } else if (quantity >= 3) {
    pointsEstimate += 15; // Bonus for 3-9 items
  }
  
  return pointsEstimate;
}

export default function EstimatedRewardPoints({ items, subtotal }: EstimatedRewardPointsProps) {
  // Calculate reward points for each item
  const itemRewardPoints = items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    points: estimateRewardPoints(item.quantity)
  }));

  // Sum up all item reward points
  const totalItemPoints = itemRewardPoints.reduce((total, item) => total + item.points, 0);
  
  // Calculate order bonus (1% of subtotal)
  const orderBonus = Math.floor(subtotal * 0.01);
  
  // Total estimated points
  const totalEstimatedPoints = totalItemPoints + orderBonus;
  
  if (items.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-md px-3 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-amber-100" />
        <span className="font-medium">You'll earn {totalEstimatedPoints} reward points</span>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-100 hover:text-white hover:bg-amber-600/50">
              <Info className="h-3.5 w-3.5" />
              <span className="sr-only">About reward points</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs p-2 max-w-[250px]">
            <div className="space-y-1">
              <p className="font-medium">Points breakdown:</p>
              <div className="flex justify-between">
                <span>Products ({totalItemPoints}):</span>
                <span>5 points per item</span>
              </div>
              <div className="flex justify-between">
                <span>Order bonus:</span>
                <span>+{orderBonus} (1% of total)</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 