import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic' // defaults to auto

type CategoryWithChildren = {
  category_id: number
  category_name: string
  parent_category_id: number | null
  image_url: string | null
  meta_title: string | null
  meta_description: string | null
  slug: string
  parentCategory: CategoryWithChildren | null
  childCategories: CategoryWithChildren[]
  products: any[]
}

interface TransformedCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image: string
  _count: {
    ecommerceProduct: number
  }
  children: TransformedCategory[]
}

interface ProductCount {
  category_id: number;
  count: number;
}

export async function GET() {
  try {
    // Test database connection first
    await prisma.$queryRaw`SELECT 1`
    console.log('Database connected successfully')

    // Get all categories with their relationships
    const categories = await prisma.$queryRaw`
      SELECT 
        c.category_id,
        c.category_name,
        c.parent_category_id,
        c.image_url,
        c.meta_title,
        c.meta_description,
        c.slug,
        '[]'::jsonb as child_categories
      FROM categories c
      WHERE c.parent_category_id IS NULL
      ORDER BY c.category_name ASC
    `

    // Get product counts for all categories
    const categoryIds = (categories as any[]).flatMap(cat => {
      const ids = [cat.category_id];
      if (cat.child_categories) {
        cat.child_categories.forEach((child: any) => {
          if (child.category_id) ids.push(child.category_id);
          if (child.childCategories) {
            child.childCategories.forEach((grandChild: any) => {
              if (grandChild.category_id) ids.push(grandChild.category_id);
            });
          }
        });
      }
      return ids;
    }).filter(id => id !== null);

    let productCounts: ProductCount[] = [];
    if (categoryIds.length > 0) {
      productCounts = await prisma.$queryRaw<ProductCount[]>`
        SELECT 
          category_id,
          CAST(COUNT(*) AS INTEGER) as count
        FROM products
        WHERE category_id IN (${Prisma.join(categoryIds)})
        GROUP BY category_id
      `;
    }

    // Create a map of category IDs to their product counts
    const productCountMap = new Map(
      productCounts.map(count => [count.category_id, Number(count.count)])
    );

    console.log('Categories fetched:', (categories as any[]).length)
    
    if (!(categories as any[]).length) {
      console.log('No categories found in database')
      // Return empty array with 200 status instead of error
      return NextResponse.json([], {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      })
    }

    // Transform the data to match the expected format
    const transformedCategories: TransformedCategory[] = (categories as any[]).map(category => ({
      id: category.category_id?.toString() || '',
      name: category.category_name || '',
      slug: category.slug || '',
      description: null,
      image: category.image_url || '/categories/category.png',
      _count: {
        ecommerceProduct: productCountMap.get(category.category_id) || 0
      },
      children: (category.child_categories || [])
        .filter((child: any) => child.category_id && child.category_name && child.slug)
        .map((child: any) => ({
          id: child.category_id.toString(),
          name: child.category_name,
          slug: child.slug,
          description: null,
          image: child.image_url || '/categories/category.png',
          _count: {
            ecommerceProduct: productCountMap.get(child.category_id) || 0
          },
          children: (child.childCategories || [])
            .filter((grandChild: any) => grandChild.category_id && grandChild.category_name && grandChild.slug)
            .map((grandChild: any) => ({
              id: grandChild.category_id.toString(),
              name: grandChild.category_name,
              slug: grandChild.slug,
              description: null,
              image: grandChild.image_url || '/categories/category.png',
              _count: {
                ecommerceProduct: productCountMap.get(grandChild.category_id) || 0
              },
              children: []
            }))
        }))
    }))

    return NextResponse.json(transformedCategories, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Detailed error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  }
} 