'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { 
  Plus, 
  MapPin, 
  CheckCircle2,
  CircleAlert
} from 'lucide-react'
import Link from 'next/link'

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

interface AddressSelectProps {
  selectedShippingAddress: number | null
  setSelectedShippingAddress: (id: number | null) => void
  selectedBillingAddress: number | null
  setSelectedBillingAddress: (id: number | null) => void
  sameAsShipping: boolean
  setSameAsShipping: (same: boolean) => void
}

export default function AddressSelect({
  selectedShippingAddress,
  setSelectedShippingAddress,
  selectedBillingAddress,
  setSelectedBillingAddress,
  sameAsShipping,
  setSameAsShipping
}: AddressSelectProps) {
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userData, setUserData] = useState<any>(null)
  
  // Check authentication status
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
  
  // Filter addresses by type
  const shippingAddresses = addresses.filter(addr => 
    addr.addressType === 'both' || addr.addressType === 'shipping'
  )
  
  const billingAddresses = addresses.filter(addr => 
    addr.addressType === 'both' || addr.addressType === 'billing'
  )
  
  const defaultShippingAddress = addresses.find(addr => addr.isDefaultShipping)
  const defaultBillingAddress = addresses.find(addr => addr.isDefaultBilling)
  
  // Fetch addresses when authenticated
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true)
        
        if (!isAuthenticated) {
          setLoading(false)
          return
        }
        
        // Add retry mechanism for better reliability
        let retries = 3;
        let data = null;
        
        while (retries > 0 && data === null) {
          try {
            const response = await fetch('/api/account/user-address')
            
            if (!response.ok) {
              throw new Error(`Failed to fetch addresses: ${response.status} ${response.statusText}`)
            }
            
            data = await response.json()
            console.log("Fetched addresses:", data)
          } catch (fetchError) {
            console.error(`Fetch attempt failed (${retries} retries left):`, fetchError)
            retries--
            
            if (retries === 0) {
              throw fetchError
            }
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        
        if (!data || !Array.isArray(data)) {
          console.error("Invalid address data received:", data)
          throw new Error("Invalid address data format")
        }
        
        setAddresses(data)
        
        // Set default selected addresses
        if (data.length > 0) {
          // Try to select default addresses first
          const defaultShipping = data.find((addr: Address) => addr.isDefaultShipping)
          const defaultBilling = data.find((addr: Address) => addr.isDefaultBilling)
          
          if (defaultShipping) {
            setSelectedShippingAddress(defaultShipping.id)
          } else {
            // Otherwise select the first shipping-compatible address
            const firstShipping = data.find((addr: Address) => 
              addr.addressType === 'both' || addr.addressType === 'shipping'
            )
            if (firstShipping) {
              setSelectedShippingAddress(firstShipping.id)
            }
          }
          
          if (defaultBilling) {
            setSelectedBillingAddress(defaultBilling.id)
          } else {
            // Otherwise select the first billing-compatible address
            const firstBilling = data.find((addr: Address) => 
              addr.addressType === 'both' || addr.addressType === 'billing'
            )
            if (firstBilling) {
              setSelectedBillingAddress(firstBilling.id)
            }
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching addresses:', error)
        setLoading(false)
        toast({
          variant: 'destructive',
          title: 'Error loading addresses',
          description: 'Could not load your addresses. Please try refreshing the page or check your connection.',
        })
      }
    }
    
    fetchAddresses()
  }, [isAuthenticated, toast, setSelectedShippingAddress, setSelectedBillingAddress])
  
  const handleShippingAddressChange = (id: string) => {
    setSelectedShippingAddress(parseInt(id))
    
    // If sameAsShipping is true, update billing address as well
    if (sameAsShipping) {
      setSelectedBillingAddress(parseInt(id))
    }
  }
  
  const handleBillingAddressChange = (id: string) => {
    setSelectedBillingAddress(parseInt(id))
  }
  
  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked)
    
    // If checked, set billing address to match shipping address
    if (checked && selectedShippingAddress) {
      setSelectedBillingAddress(selectedShippingAddress)
    }
  }
  
  // If still checking authentication status
  if (isAuthenticated === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>Loading your information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // If user is not logged in, show login prompt
  if (isAuthenticated === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>Please sign in to continue with checkout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Sign in to access your addresses</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              You need to sign in to view your saved addresses and complete checkout
            </p>
            <Button asChild>
              <Link href="/login?callback=/checkout">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Show loading state while fetching addresses
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>Select your shipping address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (addresses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>You don't have any saved addresses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No addresses found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Please add an address to continue with checkout
            </p>
            <Button asChild>
              <Link href="/account/address">Add Address</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      {/* Shipping Address Section */}
      <CardHeader>
        <CardTitle>Shipping Address</CardTitle>
        <CardDescription>Select your shipping address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {shippingAddresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border rounded-md p-4">
            <CircleAlert className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No shipping addresses available</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              You need a shipping address to continue
            </p>
            <Button asChild>
              <Link href="/account/address">Add Shipping Address</Link>
            </Button>
          </div>
        ) : (
          <RadioGroup 
            value={selectedShippingAddress?.toString() || ''}
            onValueChange={handleShippingAddressChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {shippingAddresses.map(address => (
              <div key={address.id} className="relative">
                <RadioGroupItem
                  value={address.id.toString()}
                  id={`shipping-${address.id}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`shipping-${address.id}`}
                  className="flex flex-col p-4 border rounded-md cursor-pointer transition-all peer-data-[state=checked]:border-primary"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{address.addressTitle}</span>
                    {address.isDefaultShipping && (
                      <span className="text-xs text-primary flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Default
                      </span>
                    )}
                  </div>
                  <span className="mt-1">{address.fullName}</span>
                  <span className="text-sm text-muted-foreground">{address.mobileNo}</span>
                  <span className="text-sm text-muted-foreground mt-1">{address.address}</span>
                  <span className="text-sm text-muted-foreground">{address.city}</span>
                </Label>
                <div className="absolute -top-2 -right-2 size-5 bg-primary rounded-full hidden peer-data-[state=checked]:flex items-center justify-center">
                  <CheckCircle2 className="size-4 text-primary-foreground" />
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Need a new address?
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/address">
              <Plus className="h-4 w-4 mr-1" />
              Add New Address
            </Link>
          </Button>
        </div>
        
        {/* Billing Address Section */}
        <Separator className="my-4" />
        
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="sameAsShipping" 
            checked={sameAsShipping}
            onCheckedChange={handleSameAsShippingChange}
          />
          <Label htmlFor="sameAsShipping">
            Use shipping address as billing address
          </Label>
        </div>
        
        {!sameAsShipping && (
          <>
            <div className="space-y-2">
              <div className="font-medium">Billing Address</div>
              <div className="text-sm text-muted-foreground">Select your billing address</div>
            </div>
            
            {billingAddresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center border rounded-md p-4">
                <CircleAlert className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No billing addresses available</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  You need a billing address to continue
                </p>
                <Button asChild>
                  <Link href="/account/address">Add Billing Address</Link>
                </Button>
              </div>
            ) : (
              <RadioGroup 
                value={selectedBillingAddress?.toString() || ''}
                onValueChange={handleBillingAddressChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {billingAddresses.map(address => (
                  <div key={address.id} className="relative">
                    <RadioGroupItem
                      value={address.id.toString()}
                      id={`billing-${address.id}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`billing-${address.id}`}
                      className="flex flex-col p-4 border rounded-md cursor-pointer transition-all peer-data-[state=checked]:border-primary"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{address.addressTitle}</span>
                        {address.isDefaultBilling && (
                          <span className="text-xs text-primary flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Default
                          </span>
                        )}
                      </div>
                      <span className="mt-1">{address.fullName}</span>
                      <span className="text-sm text-muted-foreground">{address.mobileNo}</span>
                      <span className="text-sm text-muted-foreground mt-1">{address.address}</span>
                      <span className="text-sm text-muted-foreground">{address.city}</span>
                    </Label>
                    <div className="absolute -top-2 -right-2 size-5 bg-primary rounded-full hidden peer-data-[state=checked]:flex items-center justify-center">
                      <CheckCircle2 className="size-4 text-primary-foreground" />
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 