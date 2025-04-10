'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  Package, 
  ShoppingBasket, 
  MapPin, 
  User, 
  Trash, 
  Check,
  Loader2,
  CircleAlert
} from 'lucide-react'
import { CartItem, useCart } from '@/app/contexts/CartContext'
import AddressSelect from '@/components/checkout/address-select'
import GuestAddressForm from '@/components/checkout/guest-address-form'
import RewardPointsSection from './components/reward-points-section'
import EstimatedRewardPoints from './components/estimated-reward-points'
import { redeemRewardPoints } from '@/services/reward-points'
import { useCurrency } from '@/app/contexts/CurrencyContext'

// Define interface for address
interface Address {
  id: number
  fullName: string
  mobileNo: string
  address: string
  city: string
  isDefaultShipping: boolean
  isDefaultBilling: boolean
  addressType: string
  addressTitle: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const { toast } = useToast()
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<number | null>(null)
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<number | null>(null)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [shippingMethod, setShippingMethod] = useState('')
  const [shippingMethods, setShippingMethods] = useState<Array<{
    id: number;
    name: string;
    description: string;
    base_cost: number;
    isActive: boolean;
  }>>([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shippingCost, setShippingCost] = useState(0)
  const [rewardPointsToUse, setRewardPointsToUse] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  const { items, totalPrice, removeItem, clearCart } = useCart()
  const { formatPrice } = useCurrency()
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/account/profile')
        
        if (response.ok) {
          const data = await response.json()
          setSession({ user: data })
          setAuthStatus('authenticated')
        } else {
          setSession(null)
          setAuthStatus('unauthenticated')
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setSession(null)
        setAuthStatus('unauthenticated')
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  // Calculate subtotal, shipping cost, points discount, and total
  const subtotal = totalPrice
  const pointsDiscount = rewardPointsToUse / 100
  const total = subtotal + shippingCost - pointsDiscount
  
  // Fetch shipping methods
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const response = await fetch('/api/shipping-methods')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch shipping methods: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Shipping methods data:', data)
        
        if (data.shippingMethods && Array.isArray(data.shippingMethods)) {
          setShippingMethods(data.shippingMethods)
          
          // Set default shipping method if none selected
          if (data.shippingMethods.length > 0 && !shippingMethod) {
            setShippingMethod(data.shippingMethods[0].id.toString())
            setShippingCost(parseFloat(data.shippingMethods[0].base_cost.toString()))
          }
        } else {
          console.error('Invalid shipping methods data format:', data)
        }
      } catch (error) {
        console.error('Error fetching shipping methods:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load shipping methods. Please refresh the page.',
        })
      }
    }
    
    fetchShippingMethods()
  }, []) // Only fetch once on component mount, not on shippingMethod change
  
  useEffect(() => {
    // Prefill user information if logged in
    if (session?.user) {
      setFullName(session.user.name || '')
      setEmail(session.user.email || '')
      setMobile(session.user.mobile || '')
    }
  }, [session])
  
  // Update shipping cost when shipping method changes
  const handleShippingMethodChange = (value: string) => {
    setShippingMethod(value)
    const selectedMethod = shippingMethods.find(method => method.id.toString() === value)
    if (selectedMethod) {
      console.log('Selected shipping method:', selectedMethod)
      setShippingCost(parseFloat(selectedMethod.base_cost.toString()))
    } else {
      console.error('Selected shipping method not found:', value)
    }
  }
  
  const handleRewardPointsChange = (points: number) => {
    setRewardPointsToUse(points)
  }
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Your cart is empty',
        description: 'Please add items to your cart before checking out.',
      })
      return
    }
    
    // Validate shipping and billing info based on authentication status
    if (authStatus === 'authenticated') {
      // For logged in users, validate addresses
      if (!selectedShippingAddress) {
        toast({
          variant: 'destructive',
          title: 'Shipping address required',
          description: 'Please select a shipping address.',
        })
        return
      }
      
      if (!sameAsShipping && !selectedBillingAddress) {
        toast({
          variant: 'destructive',
          title: 'Billing address required',
          description: 'Please select a billing address.',
        })
        return
      }
    } else {
      // For guest users, validate address fields
      if (!address || !city) {
        toast({
          variant: 'destructive',
          title: 'Shipping address required',
          description: 'Please enter your shipping address.',
        })
        return
      }
      
      if (!sameAsShipping && (!billingAddress || !billingCity)) {
        toast({
          variant: 'destructive',
          title: 'Billing address required',
          description: 'Please enter your billing address.',
        })
        return
      }
      
      if (!fullName || !mobile) {
        toast({
          variant: 'destructive',
          title: 'Contact information required',
          description: 'Please enter your name and mobile number.',
        })
        return
      }
    }
    
    if (!shippingMethod) {
      toast({
        variant: 'destructive',
        title: 'Shipping method required',
        description: 'Please select a shipping method.',
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Generate random email if not provided for guest checkout
      let userEmail = email;
      if (!userEmail && authStatus !== 'authenticated') {
        const randomString = Math.random().toString(36).substring(2, 10);
        userEmail = `guest-${randomString}@uddoog.com`;
        setEmail(userEmail);
      }
      
      // Use session data for contact info if available
      const contactInfo = session?.user ? {
        fullName: session.user.name || '',
        email: session.user.email || '',
        mobile: session.user.mobile || '',
      } : {
        fullName,
        email: userEmail,
        mobile,
      }
      
      // Construct order data based on auth status
      const orderData = authStatus === 'authenticated' ? {
        // For authenticated users
        items: items.map((item: CartItem) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          variation: item.variation,
        })),
        shippingAddressId: selectedShippingAddress,
        billingAddressId: sameAsShipping ? selectedShippingAddress : selectedBillingAddress,
        shippingMethod,
        ...contactInfo,
        subtotal,
        shippingCost,
        pointsDiscount,
        totalAmount: total,
        rewardPointsUsed: rewardPointsToUse
      } : {
        // For guest users
        items: items.map((item: CartItem) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          variation: item.variation,
        })),
        address,
        city,
        billingAddress: sameAsShipping ? address : billingAddress,
        billingCity: sameAsShipping ? city : billingCity,
        shippingMethod,
        ...contactInfo,
        subtotal,
        shippingCost,
        totalAmount: total,
      }
      
      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = 
          errorData.message || 
          errorData.error || 
          errorData.detail || 
          `Server error: ${response.status} ${response.statusText}` || 
          'Failed to create order';
        throw new Error(errorMessage);
      }
      
      const result = await response.json()
      
      // Clear cart after successful order
      clearCart()
      
      // Redirect to confirmation page
      router.push(`/checkout/confirmation?orderId=${result.order.id}`)
    } catch (err) {
      console.error('Order submission error:', err)
      toast({
        variant: 'destructive',
        title: 'Checkout failed',
        description: err instanceof Error ? err.message : 'An error occurred during checkout.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="container py-10 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Address and Shipping */}
          <div className="md:col-span-2 space-y-6">
            {/* Show different address components based on auth status */}
            {authStatus === 'authenticated' ? (
              <AddressSelect 
                selectedShippingAddress={selectedShippingAddress}
                setSelectedShippingAddress={setSelectedShippingAddress}
                selectedBillingAddress={selectedBillingAddress}
                setSelectedBillingAddress={setSelectedBillingAddress}
                sameAsShipping={sameAsShipping}
                setSameAsShipping={setSameAsShipping}
              />
            ) : (
              <GuestAddressForm
                fullName={fullName}
                setFullName={setFullName}
                mobile={mobile}
                setMobile={setMobile}
                email={email}
                setEmail={setEmail}
                address={address}
                setAddress={setAddress}
                city={city}
                setCity={setCity}
                sameAsShipping={sameAsShipping}
                setSameAsShipping={setSameAsShipping}
                billingAddress={billingAddress}
                setBillingAddress={setBillingAddress}
                billingCity={billingCity}
                setBillingCity={setBillingCity}
              />
            )}
            
            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Method</CardTitle>
                <CardDescription>Select how you want your order delivered</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : shippingMethods.length > 0 ? (
                  <RadioGroup 
                    value={shippingMethod} 
                    onValueChange={handleShippingMethodChange}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {shippingMethods.map((method) => (
                      <div key={method.id} className="flex items-start space-x-3 border p-4 rounded-md h-full">
                        <RadioGroupItem value={method.id.toString()} id={`shipping-${method.id}`} />
                        <div className="flex-1">
                          <Label htmlFor={`shipping-${method.id}`} className="font-medium">{method.name}</Label>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        <div className="font-medium">${parseFloat(method.base_cost.toString()).toFixed(2)}</div>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-center py-4 border rounded-md p-4">
                    <CircleAlert className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No shipping methods available.</p>
                    <p className="text-sm text-muted-foreground mt-1">Please try again later or contact support.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Order Summary */}
          <div>
            <div className="space-y-4 sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 relative bg-muted rounded-md overflow-hidden">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.variation && (
                          <p className="text-sm text-muted-foreground">
                            {item.variation.name}: {item.variation.value}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  
                  {/* Reward Points Section */}
                  {authStatus === 'authenticated' && (
                    <RewardPointsSection 
                      setPointsToUse={setRewardPointsToUse} 
                      subtotal={subtotal}
                    />
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>
                    {pointsDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Reward Points Discount</span>
                        <span>-{formatPrice(pointsDiscount)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(Math.max(0, total))}</span>
                  </div>
                  
                  {/* Show estimated reward points for this order */}
                  {items.length > 0 && (
                    <EstimatedRewardPoints items={items} subtotal={subtotal} />
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || items.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                  
                  <div className="text-xs text-center text-muted-foreground">
                    By placing your order, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
} 