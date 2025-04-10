'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Plus, 
  MapPin, 
  Edit, 
  Trash, 
  CheckCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AddressForm from './AddressForm'

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

export default function AddressPage() {
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/account/user-address')
        
        if (!response.ok) {
          throw new Error('Failed to fetch addresses')
        }
        
        const data = await response.json()
        setAddresses(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching addresses:', error)
        setLoading(false)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load addresses. Please try again later.',
        })
      }
    }

    fetchAddresses()
  }, [toast])

  const handleAddNewAddress = () => {
    setEditingId(null)
    setIsDialogOpen(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingId(address.id)
    setIsDialogOpen(true)
  }

  const handleDeleteAddress = async (id: number) => {
    try {
      const response = await fetch(`/api/account/user-address/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete address')
      }
      
      // Remove the address from the state
      setAddresses(addresses.filter(address => address.id !== id))
      
      toast({
        title: 'Address Deleted',
        description: 'The address has been deleted successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'There was an error deleting the address. Please try again.',
      })
    }
  }

  const handleSetDefaultShipping = async (id: number) => {
    try {
      const address = addresses.find(a => a.id === id)
      if (!address) return

      const response = await fetch('/api/account/user-address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...address,
          isDefaultShipping: true
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update address')
      }
      
      const updatedAddress = await response.json()
      
      // Update the addresses to set the new default
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefaultShipping: addr.id === id
      })))
      
      toast({
        title: 'Default Shipping Address Updated',
        description: 'Your default shipping address has been updated.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating the default address. Please try again.',
      })
    }
  }

  const handleSetDefaultBilling = async (id: number) => {
    try {
      const address = addresses.find(a => a.id === id)
      if (!address) return

      const response = await fetch('/api/account/user-address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...address,
          isDefaultBilling: true
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update address')
      }
      
      const updatedAddress = await response.json()
      
      // Update the addresses to set the new default
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefaultBilling: addr.id === id
      })))
      
      toast({
        title: 'Default Billing Address Updated',
        description: 'Your default billing address has been updated.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating the default address. Please try again.',
      })
    }
  }

  const handleFormSubmitted = () => {
    setIsDialogOpen(false)
    
    // Refresh the addresses list
    fetchAddresses()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <Skeleton className="h-6 w-36" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-64" />
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <div className="flex-1 flex items-center">
            <CardTitle>My Addresses</CardTitle>
            <Button 
              onClick={handleAddNewAddress} 
              className="ml-3 h-7 px-2 text-xs flex items-center gap-1"
              size="sm"
            >
              <Plus size={12} />
              <span>Add New</span>
            </Button>
          </div>
        </div>
        <CardDescription>Manage your shipping and billing addresses</CardDescription>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You don't have any saved addresses yet.</p>
            <Button onClick={handleAddNewAddress}>Add Your First Address</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(address => (
              <div key={address.id} className="border rounded-lg p-3 relative hover:shadow-sm transition-shadow">
                <div className="absolute top-2 right-2 flex gap-1">
                  {address.isDefaultShipping && (
                    <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle size={10} />
                      <span className="whitespace-nowrap">Default Ship</span>
                    </span>
                  )}
                  {address.isDefaultBilling && (
                    <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle size={10} />
                      <span className="whitespace-nowrap">Default Bill</span>
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-start mt-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <p className="font-medium text-sm">{address.fullName}</p>
                      <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                        {address.addressTitle}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{address.mobileNo}</p>
                    <p className="text-xs">{address.address}</p>
                    <p className="text-xs">{address.city}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {address.addressType === 'shipping' ? 'Shipping Only' : 
                       address.addressType === 'billing' ? 'Billing Only' : 
                       'Shipping & Billing'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-end gap-1.5 mt-3 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => handleEditAddress(address)}
                    title="Edit Address"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => handleDeleteAddress(address.id)}
                    title="Delete Address"
                  >
                    <Trash size={14} className="mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(address.address + ', ' + address.city)}`, '_blank')}
                    title="View on Map"
                  >
                    <MapPin size={14} className="mr-1" />
                    Map
                  </Button>
                  
                  {!address.isDefaultShipping && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleSetDefaultShipping(address.id)}
                    >
                      Default Ship
                    </Button>
                  )}
                  {!address.isDefaultBilling && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleSetDefaultBilling(address.id)}
                    >
                      Default Bill
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update your address details.' : 'Enter your address details.'}
            </DialogDescription>
          </DialogHeader>
          
          <AddressForm 
            editingId={editingId} 
            initialData={editingId ? addresses.find(a => a.id === editingId) : {}}
            onCancel={() => setIsDialogOpen(false)}
            onSubmitted={handleFormSubmitted}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
} 