import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Plus, CheckCircle } from 'lucide-react'
import AddressForm from '@/app/account/address/AddressForm'

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

interface AddressSelectionProps {
  type: 'shipping' | 'billing'
  selectedAddressId: number | null
  onAddressSelect: (addressId: number) => void
}

export default function AddressSelection({ 
  type, 
  selectedAddressId, 
  onAddressSelect 
}: AddressSelectionProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/account/user-address')
        
        if (!response.ok) {
          throw new Error('Failed to fetch addresses')
        }
        
        const data = await response.json()
        setAddresses(data)
      } catch (error) {
        console.error('Error fetching addresses:', error)
        setError('Failed to load addresses. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [])

  useEffect(() => {
    // Filter addresses based on type (shipping or billing)
    if (addresses.length > 0) {
      let filtered = []
      
      if (type === 'shipping') {
        filtered = addresses.filter(addr => 
          addr.addressType === 'shipping' || addr.addressType === 'both'
        )
        
        // If there's a default shipping address, put it first
        filtered.sort((a, b) => 
          b.isDefaultShipping ? 1 : a.isDefaultShipping ? -1 : 0
        )
      } else {
        filtered = addresses.filter(addr => 
          addr.addressType === 'billing' || addr.addressType === 'both'
        )
        
        // If there's a default billing address, put it first
        filtered.sort((a, b) => 
          b.isDefaultBilling ? 1 : a.isDefaultBilling ? -1 : 0
        )
      }
      
      setFilteredAddresses(filtered)
      
      // Auto-select the default address if no address is selected
      if (!selectedAddressId && filtered.length > 0) {
        const defaultAddress = filtered.find(addr => 
          type === 'shipping' ? addr.isDefaultShipping : addr.isDefaultBilling
        )
        
        if (defaultAddress) {
          onAddressSelect(defaultAddress.id)
        } else {
          // If no default, select the first one
          onAddressSelect(filtered[0].id)
        }
      }
    }
  }, [addresses, type, selectedAddressId, onAddressSelect])

  const handleAddressAdded = (newAddress: Address) => {
    setAddresses(prev => [...prev, newAddress])
    setIsAddressFormOpen(false)
    
    // Auto-select the newly added address
    onAddressSelect(newAddress.id)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4 border rounded-md p-4">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{type === 'shipping' ? 'Shipping Address' : 'Billing Address'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-500">
            {error}
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center">
          <CardTitle>{type === 'shipping' ? 'Shipping Address' : 'Billing Address'}</CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            className="ml-3 h-7 px-2 text-xs flex items-center gap-1"
            onClick={() => setIsAddressFormOpen(true)}
          >
            <Plus size={12} />
            <span>Add New</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAddresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              You don't have any saved {type === 'shipping' ? 'shipping' : 'billing'} addresses.
            </p>
            <Button onClick={() => setIsAddressFormOpen(true)}>
              Add {type === 'shipping' ? 'Shipping' : 'Billing'} Address
            </Button>
          </div>
        ) : (
          <RadioGroup
            defaultValue={selectedAddressId?.toString()}
            value={selectedAddressId?.toString()}
            onValueChange={(value) => onAddressSelect(parseInt(value))}
            className="space-y-3"
          >
            {filteredAddresses.map((address) => (
              <div key={address.id} className="flex items-start space-x-2 border rounded-md p-2 hover:bg-accent/5 transition-colors">
                <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} className="mt-1" />
                <div className="grid gap-0.5 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label 
                        htmlFor={`address-${address.id}`}
                        className="font-medium text-sm cursor-pointer"
                      >
                        {address.fullName}
                      </Label>
                      <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                        {address.addressTitle}
                      </span>
                    </div>
                    
                    {(type === 'shipping' && address.isDefaultShipping) || 
                     (type === 'billing' && address.isDefaultBilling) ? (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle size={10} />
                        <span>Default</span>
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>{address.mobileNo}</p>
                    <p>{address.address}</p>
                    <p>{address.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
      </CardContent>

      <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          
          <AddressForm 
            onAddressAdded={handleAddressAdded} 
            onCancel={() => setIsAddressFormOpen(false)}
            initialData={{
              addressType: type === 'shipping' ? 'shipping' : 'billing',
              isDefaultShipping: type === 'shipping',
              isDefaultBilling: type === 'billing'
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
} 