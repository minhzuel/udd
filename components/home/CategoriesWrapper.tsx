import { CategoriesClient } from './Categories'

export async function CategoriesWrapper() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }
    
    const categories = await response.json()
    return <CategoriesClient categories={categories} />
  } catch (error) {
    console.error('Error fetching categories:', error)
    return <CategoriesClient categories={[]} />
  }
} 