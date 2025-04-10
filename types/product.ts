export interface Product {
  id: number
  name: string
  sku: string
  price: number
  offerPrice: number | null
  description: string
  category: {
    id: number
    name: string
    slug: string
  }
  specifications: {
    name: string
    value: string
  }[]
  images: {
    imageUrl: string
    isMain: boolean
  }[]
  inventory: {
    quantity: number
  } | null
} 