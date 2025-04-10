'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoriesTab } from './CategoriesTab'
import { BrandsTab } from './BrandsTab'
import { StoresTab } from './StoresTab'

export function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories')

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Browse by Category</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="brands">
          <BrandsTab />
        </TabsContent>
        <TabsContent value="stores">
          <StoresTab />
        </TabsContent>
      </Tabs>
    </div>
  )
} 