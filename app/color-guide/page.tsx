'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

// Map standard color names to their hex values
const colorMap: Record<string, string> = {
  'red': '#FF0000',
  'blue': '#0000FF',
  'green': '#008000',
  'yellow': '#FFFF00',
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
  'navy': '#000080',
  'teal': '#008080',
  'maroon': '#800000',
  'olive': '#808000',
  'lime': '#00FF00',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'silver': '#C0C0C0',
  'gold': '#FFD700'
}

export default function ColorGuidePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Standard Color Guide</h1>
      <p className="text-lg mb-8">
        Our products are available in these standard colors. The color you see on your screen may vary slightly from the actual product.
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Object.entries(colorMap).map(([colorName, hexValue]) => (
          <Card key={colorName} className="p-4 flex flex-col items-center">
            <div 
              className="w-16 h-16 rounded-full mb-2 border border-gray-200"
              style={{ backgroundColor: hexValue }}
            />
            <div className="text-center">
              <p className="font-medium capitalize">{colorName}</p>
              <p className="text-sm text-muted-foreground">{hexValue}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">About Our Color Selection</h2>
        <p className="text-muted-foreground mb-4">
          We've standardized our product colors to ensure consistency across our catalog. 
          When shopping, you'll see these exact color names used for all product variations.
        </p>
        <p className="text-muted-foreground">
          If you have any questions about a specific product's color, please contact our customer support team.
        </p>
      </div>
    </div>
  )
} 