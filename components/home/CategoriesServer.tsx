import prisma from '@/lib/prisma'
import { CategoriesClient } from './CategoriesClient'

export async function CategoriesServer() {
  try {
    console.log('Starting to fetch categories...')
    
    // Test database connection first
    await prisma.$queryRaw`SELECT 1`
    console.log('Database connected successfully')

    // Fetch all categories with their relationships using raw SQL
    const categories = await prisma.$queryRaw`
      SELECT 
        c.*,
        json_agg(
          json_build_object(
            'category_id', cc.category_id,
            'category_name', cc.category_name,
            'parent_category_id', cc.parent_category_id,
            'image_url', cc.image_url,
            'meta_title', cc.meta_title,
            'meta_description', cc.meta_description,
            'slug', cc.slug,
            'childCategories', (
              SELECT json_agg(
                json_build_object(
                  'category_id', ccc.category_id,
                  'category_name', ccc.category_name,
                  'parent_category_id', ccc.parent_category_id,
                  'image_url', ccc.image_url,
                  'meta_title', ccc.meta_title,
                  'meta_description', ccc.meta_description,
                  'slug', ccc.slug
                )
              )
              FROM categories ccc
              WHERE ccc.parent_category_id = cc.category_id
            )
          )
        ) as child_categories
      FROM categories c
      LEFT JOIN categories cc ON cc.parent_category_id = c.category_id
      WHERE c.parent_category_id IS NULL
      GROUP BY c.category_id, c.category_name, c.parent_category_id, c.image_url, c.meta_title, c.meta_description, c.slug
      ORDER BY c.category_name ASC
    `

    console.log('Categories fetched:', (categories as any[]).length)
    
    // If no categories found, return empty state
    if (!(categories as any[]).length) {
      console.log('No categories found in database')
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-base font-semibold flex items-center gap-2">
              Categories
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No categories found
          </div>
        </div>
      )
    }

    // Transform the data to match the expected format
    const transformedCategories = (categories as any[]).map(category => ({
      id: category.category_id,
      name: category.category_name,
      slug: category.slug,
      description: null,
      image: category.image_url || '/categories/category.png',
      childCategories: (category.child_categories || []).map((child: any) => ({
        id: child.category_id,
        name: child.category_name,
        slug: child.slug,
        description: null,
        image: child.image_url || '/categories/category.png',
        childCategories: (child.childCategories || []).map((grandChild: any) => ({
          id: grandChild.category_id,
          name: grandChild.category_name,
          slug: grandChild.slug,
          description: null,
          image: grandChild.image_url || '/categories/category.png',
          childCategories: []
        }))
      }))
    }))

    return <CategoriesClient initialCategories={transformedCategories} />
  } catch (error) {
    console.error('Error fetching categories:', error)
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[400px] flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-base font-semibold flex items-center gap-2">
            Categories
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-red-500">
          Error loading categories
        </div>
      </div>
    )
  }
} 