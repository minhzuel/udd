import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'

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

interface AddressFormProps {
  onAddressAdded?: (address: Address) => void
  onCancel?: () => void
  onSubmitted?: () => void
  editingId?: number | null
  initialData?: Partial<{
    fullName: string
    mobileNo: string
    address: string
    city: string
    isDefaultShipping: boolean
    isDefaultBilling: boolean
    addressType: string
    addressTitle: string
  }>
}

export default function AddressForm({
  onAddressAdded,
  onCancel,
  onSubmitted,
  editingId = null,
  initialData = {}
}: AddressFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    mobileNo: initialData.mobileNo || '',
    address: initialData.address || '',
    city: initialData.city || '',
    isDefaultShipping: initialData.isDefaultShipping || false,
    isDefaultBilling: initialData.isDefaultBilling || false,
    addressType: initialData.addressType || 'both',
    addressTitle: initialData.addressTitle || 'Home'
  })
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = '/api/account/user-address'
      const body = editingId 
        ? { ...formData, id: editingId } 
        : formData
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...body,
          mobile: body.mobileNo, // API expects mobile instead of mobileNo
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save address')
      }
      
      const savedAddress = await response.json()
      
      toast({
        title: editingId ? 'Address Updated' : 'Address Added',
        description: editingId 
          ? 'Your address has been updated successfully.' 
          : 'Your new address has been added successfully.',
      })
      
      if (onAddressAdded) {
        onAddressAdded(savedAddress)
      }
      
      if (onSubmitted) {
        onSubmitted()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'There was an error saving the address. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="addressTitle">Address Title</Label>
        <Input
          id="addressTitle"
          name="addressTitle"
          value={formData.addressTitle}
          onChange={handleInputChange}
          placeholder="Home, Work, etc."
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Your full name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mobileNo">Mobile Number</Label>
        <Input
          id="mobileNo"
          name="mobileNo"
          value={formData.mobileNo}
          onChange={handleInputChange}
          placeholder="Your mobile number"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Your address"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="Your city"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Address Type</Label>
        <Select 
          value={formData.addressType}
          onValueChange={(value) => handleSelectChange('addressType', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select address type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Shipping & Billing</SelectItem>
            <SelectItem value="shipping">Shipping Only</SelectItem>
            <SelectItem value="billing">Billing Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isDefaultShipping"
          checked={formData.isDefaultShipping}
          onCheckedChange={(checked) => 
            handleCheckboxChange('isDefaultShipping', checked as boolean)
          }
        />
        <Label 
          htmlFor="isDefaultShipping" 
          className="cursor-pointer text-sm font-normal"
        >
          Set as default shipping address
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isDefaultBilling"
          checked={formData.isDefaultBilling}
          onCheckedChange={(checked) => 
            handleCheckboxChange('isDefaultBilling', checked as boolean)
          }
        />
        <Label 
          htmlFor="isDefaultBilling" 
          className="cursor-pointer text-sm font-normal"
        >
          Set as default billing address
        </Label>
      </div>
      
      <DialogFooter>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Address'}
        </Button>
      </DialogFooter>
    </form>
  )
} 