'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

interface GuestAddressFormProps {
  fullName: string
  setFullName: (value: string) => void
  mobile: string
  setMobile: (value: string) => void
  email: string
  setEmail: (value: string) => void
  address: string
  setAddress: (value: string) => void
  city: string
  setCity: (value: string) => void
  sameAsShipping: boolean
  setSameAsShipping: (value: boolean) => void
  billingAddress: string
  setBillingAddress: (value: string) => void
  billingCity: string
  setBillingCity: (value: string) => void
}

export default function GuestAddressForm({
  fullName,
  setFullName,
  mobile,
  setMobile,
  email,
  setEmail,
  address,
  setAddress,
  city,
  setCity,
  sameAsShipping,
  setSameAsShipping,
  billingAddress,
  setBillingAddress,
  billingCity,
  setBillingCity
}: GuestAddressFormProps) {
  
  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked)
    
    // If checked, copy the shipping address to billing address
    if (checked) {
      setBillingAddress(address)
      setBillingCity(city)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
        <CardDescription>Please provide your contact and address details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your full name"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input 
                id="mobile" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)} 
                placeholder="Enter your mobile number"
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input 
              id="address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Enter your street address"
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input 
                id="city" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                placeholder="Enter your city"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email address (optional)"
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Billing Address */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsShipping"
              checked={sameAsShipping}
              onCheckedChange={handleSameAsShippingChange}
            />
            <Label htmlFor="sameAsShipping" className="font-medium">
              Billing address same as shipping address
            </Label>
          </div>
          
          {!sameAsShipping && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address *</Label>
                <Input 
                  id="billingAddress" 
                  value={billingAddress} 
                  onChange={(e) => setBillingAddress(e.target.value)} 
                  placeholder="Enter your billing address"
                  required={!sameAsShipping}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCity">Billing City *</Label>
                <Input 
                  id="billingCity" 
                  value={billingCity} 
                  onChange={(e) => setBillingCity(e.target.value)} 
                  placeholder="Enter your billing city"
                  required={!sameAsShipping}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 