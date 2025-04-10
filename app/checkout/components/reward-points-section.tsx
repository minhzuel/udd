'use client'

import { useState, useEffect } from 'react'
import { Award, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface RewardPointsSectionProps {
  subtotal: number
  setPointsToUse: (points: number) => void
}

export default function RewardPointsSection({ subtotal, setPointsToUse }: RewardPointsSectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [availablePoints, setAvailablePoints] = useState(0)
  const [usePoints, setUsePoints] = useState(false)
  const [pointsToUseLocal, setPointsToUseLocal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Max discount can be 90% of the total
  const maxAllowedDiscount = subtotal * 0.9
  // Convert points to currency (100 points = $1)
  const pointsConversionRate = 100
  // Maximum points that can be used based on subtotal
  const maxPointsForOrder = Math.floor(maxAllowedDiscount * pointsConversionRate)
  
  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/account/profile')
        
        if (response.ok) {
          const data = await response.json()
          setIsAuthenticated(true)
          setUserData(data)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()
  }, [])
  
  // Fetch reward points if authenticated
  useEffect(() => {
    if (isAuthenticated && userData) {
      fetchAvailablePoints()
    }
  }, [isAuthenticated, userData])
  
  // Reset points to use when checkbox is toggled
  useEffect(() => {
    if (!usePoints) {
      setPointsToUseLocal(0)
      setPointsToUse(0)
    }
  }, [usePoints, setPointsToUse])

  // Update parent component when local points change
  useEffect(() => {
    setPointsToUse(pointsToUseLocal)
  }, [pointsToUseLocal, setPointsToUse])
  
  // Fetch available points from the API
  const fetchAvailablePoints = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/account/reward-points')
      
      // Handle error responses gracefully
      if (!response.ok) {
        console.warn(`Reward points API returned status: ${response.status}`)
        // Don't throw an error, just log it and set error state
        setError('Could not load your reward points')
        setAvailablePoints(0)
        return
      }
      
      const data = await response.json()
      setAvailablePoints(data.availablePoints || 0)
    } catch (err) {
      console.error('Error fetching reward points:', err)
      setError('Could not load your reward points')
      setAvailablePoints(0)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle applying max points
  const handleUseMaxPoints = () => {
    const maxPoints = Math.min(availablePoints, maxPointsForOrder)
    setPointsToUseLocal(maxPoints)
  }
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const points = Math.floor(value[0])
    setPointsToUseLocal(points)
  }
  
  // Handle input change 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let points = parseInt(e.target.value) || 0
    
    // Ensure points don't exceed available points
    points = Math.min(points, availablePoints)
    
    // Ensure points don't exceed max allowed for this order
    points = Math.min(points, maxPointsForOrder)
    
    setPointsToUseLocal(points)
  }
  
  // Calculate discount amount
  const discountAmount = (pointsToUseLocal / pointsConversionRate)
  
  // When not authenticated, don't show anything
  if (!isAuthenticated) {
    return null
  }

  // If there's an error but the user is authenticated, show error UI
  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            Reward Points
          </CardTitle>
          <CardDescription className="text-amber-600">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  // If there are no available points, don't show control
  if (!availablePoints) {
    return null
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            Reward Points
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">About reward points</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">100 points = $1 discount</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>You have {availablePoints} points available</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="usePoints" 
              checked={usePoints} 
              onCheckedChange={(checked) => setUsePoints(checked as boolean)} 
            />
            <Label htmlFor="usePoints">Use reward points for this order</Label>
          </div>
          
          {usePoints && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Slider
                    value={[pointsToUseLocal]}
                    max={Math.min(availablePoints, maxPointsForOrder)}
                    step={100}
                    onValueChange={handleSliderChange}
                  />
                </div>
                <div className="w-20">
                  <Input 
                    type="number" 
                    value={pointsToUseLocal} 
                    onChange={handleInputChange}
                    min={0}
                    max={Math.min(availablePoints, maxPointsForOrder)}
                    className="h-8"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUseMaxPoints}
                  className="h-8 text-xs"
                >
                  Max
                </Button>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points to use:</span>
                  <span>{pointsToUseLocal}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Discount amount:</span>
                  <span className="text-primary">${discountAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 