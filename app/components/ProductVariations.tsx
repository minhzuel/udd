'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card } from "@/components/ui/card"

interface Option {
  id: string
  value: string
  optionGroup: {
    id: string
    name: string
  }
}

interface Variation {
  id: string
  sku: string | null
  price: number
  stockValue: number
  isDefault: boolean
  options: Option[]
}

interface ProductVariationsProps {
  variations: Variation[]
  selectedVariation: Variation | null
  onVariationSelect: (variation: Variation) => void
}

export default function ProductVariations({
  variations,
  selectedVariation,
  onVariationSelect,
}: ProductVariationsProps) {
  // Group options by optionGroup
  const optionGroups = variations.reduce((groups, variation) => {
    variation.options.forEach((option) => {
      const groupName = option.optionGroup.name
      if (!groups[groupName]) {
        groups[groupName] = new Set()
      }
      groups[groupName].add(option.value)
    })
    return groups
  }, {} as Record<string, Set<string>>)

  const findVariationByOptions = (selectedOptions: Record<string, string>) => {
    return variations.find((variation) =>
      variation.options.every(
        (option) => selectedOptions[option.optionGroup.name] === option.value
      )
    )
  }

  const handleOptionSelect = (groupName: string, value: string) => {
    const currentOptions = selectedVariation?.options.reduce(
      (acc, opt) => ({
        ...acc,
        [opt.optionGroup.name]: opt.value,
      }),
      {} as Record<string, string>
    ) || {}

    const newOptions = {
      ...currentOptions,
      [groupName]: value,
    }

    const newVariation = findVariationByOptions(newOptions)
    if (newVariation) {
      onVariationSelect(newVariation)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {Object.entries(optionGroups).map(([groupName, values]) => (
          <div key={groupName}>
            <h3 className="text-sm font-medium mb-2">{groupName}</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(values).map((value) => {
                const isSelected = selectedVariation?.options.some(
                  (opt) =>
                    opt.optionGroup.name === groupName && opt.value === value
                )
                return (
                  <button
                    key={value}
                    onClick={() => handleOptionSelect(groupName, value)}
                    className={`px-3 py-1 rounded-md text-sm border transition-colors
                      ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input hover:bg-accent hover:text-accent-foreground"
                      }
                    `}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 