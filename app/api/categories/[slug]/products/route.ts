import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Context = {
  params: {
    slug: string
  }
}

// Verify database connection
async function verifyDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    // First verify database connection
    const isConnected = await verifyDatabaseConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }

    const slug = params.slug
    console.log('API route called with slug:', slug)
    
    if (!slug) {
      console.error('No category slug provided')
      return NextResponse.json(
        { error: 'Category slug is required' },
        { status: 400 }
      )
    }

    // Validate that the slug only contains valid characters
    const validSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!validSlugRegex.test(slug)) {
      console.error('Invalid category slug format:', slug)
      return NextResponse.json(
        { error: 'Invalid category slug format' },
        { status: 400 }
      )
    }

    const { searchParams } = request.nextUrl
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '15000')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const inStock = searchParams.get('inStock') === 'true'
    const onSale = searchParams.get('onSale') === 'true'
    const subCategory = searchParams.get('subCategory') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const skip = (page - 1) * limit

    // Extract variation filters from query parameters
    const variationFilters: Record<string, string[]> = {}
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('variation_')) {
        const variationName = key.replace('variation_', '')
        variationFilters[variationName] = value.split(',')
      }
    }

    console.log('Query parameters:', {
      minPrice,
      maxPrice,
      sortBy,
      inStock,
      onSale,
      subCategory,
      page,
      limit,
      skip,
      variationFilters
    })

    // First get the category
    let category
    try {
      category = await prisma.categories.findFirst({
        where: {
          slug: slug
        },
        select: {
          category_id: true,
          category_name: true,
          slug: true,
          meta_description: true,
          image_url: true,
          meta_title: true,
          other_categories: {
            select: {
              category_id: true,
              category_name: true,
              slug: true,
              image_url: true,
              meta_description: true,
              meta_title: true
            }
          }
        }
      })

      if (!category) {
        console.error('Category not found for slug:', slug)
        return NextResponse.json(
          { error: 'Category not found', slug },
          { status: 404 }
        )
      }

      console.log('Category found:', JSON.stringify(category, null, 2))
    } catch (error) {
      console.error('Error fetching category:', error)
      return NextResponse.json(
        { 
          error: 'Database error while fetching category', 
          details: error instanceof Error ? error.message : String(error),
          query: { slug }
        },
        { status: 500 }
      )
    }

    // Build where clause for products
    let where: any = {
      category_id: category.category_id,
      AND: [
        ...(minPrice > 0 || maxPrice < 15000 ? [
          {
            OR: [
              { price: { gte: minPrice, lte: maxPrice } },
              { offerPrice: { gte: minPrice, lte: maxPrice } }
            ]
          }
        ] : []),
        ...(inStock ? [{ inventory: { some: { quantity: { gt: 0 } } } }] : []),
        ...(onSale ? [
          { 
            offerPrice: { not: null },
            offerExpiry: { gt: new Date() }
          }
        ] : []),
        ...(subCategory !== 'all' ? [{ category: { slug: subCategory } }] : [])
      ]
    }

    // Add variation filters if they exist
    if (Object.keys(variationFilters).length > 0) {
      // For each variation filter, add a condition to check for products 
      // that have variation combinations matching the criteria
      const variationConditions = Object.entries(variationFilters).map(([name, values]) => {
        return {
          variationCombinations: {
            some: {
              OR: [
                {
                  variation1: {
                    name,
                    value: { in: values }
                  }
                },
                {
                  variation2: {
                    name,
                    value: { in: values }
                  }
                },
                {
                  variation3: {
                    name,
                    value: { in: values }
                  }
                }
              ]
            }
          }
        }
      })
      
      // Add the variation conditions to the AND clause
      where.AND = [...where.AND, ...variationConditions]
    }

    console.log('Category ID:', category.category_id)
    console.log('Where clause:', JSON.stringify(where, null, 2))

    // Build orderBy based on sortBy
    let orderBy:any = { product_id: 'desc' }; // Default

    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'name_asc') {
      orderBy = { name: 'asc' };
    } else if (sortBy === 'name_desc') {
      orderBy = { name: 'desc' };
    }

    console.log('Order by:', orderBy);

    // Get total count for pagination
    let total
    try {
      total = await prisma.products.count({ where })
      console.log('Total products found:', total)
    } catch (error) {
      console.error('Error counting products:', error)
      return NextResponse.json(
        { error: 'Database error while counting products', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }

    // First, let's check if there are any products at all for this category
    let allProducts
    try {
      allProducts = await prisma.products.findMany({
        where: { category_id: category.category_id },
        select: { product_id: true, name: true, price: true, offer_price: true }
      })
      console.log('All products for category:', allProducts)
    } catch (error) {
      console.error('Error fetching all products:', error)
      return NextResponse.json(
        { error: 'Database error while fetching all products', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }

    let products
    try {
      products = await prisma.products.findMany({
        where,
        orderBy: orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          product_id: true,
          name: true,
          description: true,
          price: true,
          offer_price: true,
          offer_expiry: true,
          sku: true,
          main_image: true,
          inventory: {
            select: {
              quantity: true
            },
            take: 1
          },
          category_id: true,
          categories: {
            select: {
              category_name: true,
              slug: true
            }
          },
          product_specifications: {
            select: {
              specification_id: true,
              specification_name: true,
              specification_value: true
            }
          },
          product_variation_combinations: {
            select: {
              combination_id: true,
              price: true,
              offer_price: true,
              stock_quantity: true,
              variation_id_1: true,
              variation_id_2: true,
              variation_id_3: true,
              product_variations_product_variation_combinations_variation_id_1Toproduct_variations: {
                select: {
                  variation_id: true,
                  variation_name: true,
                  variation_value: true
                }
              },
              product_variations_product_variation_combinations_variation_id_2Toproduct_variations: {
                select: {
                  variation_id: true,
                  variation_name: true,
                  variation_value: true
                }
              },
              product_variations_product_variation_combinations_variation_id_3Toproduct_variations: {
                select: {
                  variation_id: true,
                  variation_name: true,
                  variation_value: true
                }
              }
            }
          }
        }
      })

      // Collect all unique variations for filtering
      const availableVariations: Record<string, Set<string>> = {}
      
      products.forEach(product => {
        if (product.product_variation_combinations && product.product_variation_combinations.length > 0) {
          product.product_variation_combinations.forEach(combo => {
            // Check variation 1
            if (combo.variation_id_1 && combo.product_variations_product_variation_combinations_variation_id_1Toproduct_variations) {
              const { variation_name, variation_value } = combo.product_variations_product_variation_combinations_variation_id_1Toproduct_variations
              if (!availableVariations[variation_name]) {
                availableVariations[variation_name] = new Set()
              }
              availableVariations[variation_name].add(variation_value)
            }
            
            // Check variation 2
            if (combo.variation_id_2 && combo.product_variations_product_variation_combinations_variation_id_2Toproduct_variations) {
              const { variation_name, variation_value } = combo.product_variations_product_variation_combinations_variation_id_2Toproduct_variations
              if (!availableVariations[variation_name]) {
                availableVariations[variation_name] = new Set()
              }
              availableVariations[variation_name].add(variation_value)
            }
            
            // Check variation 3
            if (combo.variation_id_3 && combo.product_variations_product_variation_combinations_variation_id_3Toproduct_variations) {
              const { variation_name, variation_value } = combo.product_variations_product_variation_combinations_variation_id_3Toproduct_variations
              if (!availableVariations[variation_name]) {
                availableVariations[variation_name] = new Set()
              }
              availableVariations[variation_name].add(variation_value)
            }
          })
        }
      })

      // Convert Sets to arrays for the response
      const variationsForFiltering: Record<string, string[]> = {}
      for (const [name, values] of Object.entries(availableVariations)) {
        variationsForFiltering[name] = Array.from(values)
      }

      console.log('Available variations for filtering:', variationsForFiltering)

      // Transform the products to match the expected format
      const transformedProducts = products.map(product => {
        // Calculate price ranges for products with variations
        let minPrice = Number(product.price);
        let maxPrice = Number(product.price);
        let minOfferPrice = product.offer_price ? Number(product.offer_price) : null;
        let maxOfferPrice = product.offer_price ? Number(product.offer_price) : null;
        
        // Calculate min and max discount percentages
        let minDiscountPercentage = 0;
        let maxDiscountPercentage = 0;
        
        if (product.product_variation_combinations && product.product_variation_combinations.length > 0) {
          // Find min and max prices from combinations
          const prices = product.product_variation_combinations
            .filter(vc => vc.price !== null)
            .map(vc => Number(vc.price));
            
          const offerPrices = product.product_variation_combinations
            .filter(vc => vc.offer_price !== null)
            .map(vc => Number(vc.offer_price));
          
          if (prices.length > 0) {
            minPrice = Math.min(...prices, minPrice);
            maxPrice = Math.max(...prices, maxPrice);
          }
          
          if (offerPrices.length > 0) {
            minOfferPrice = minOfferPrice !== null ? Math.min(...offerPrices, minOfferPrice) : Math.min(...offerPrices);
            maxOfferPrice = maxOfferPrice !== null ? Math.max(...offerPrices, maxOfferPrice) : Math.max(...offerPrices);
          }
        }
        
        // Calculate discount percentages
        if (minOfferPrice !== null && minPrice > 0) {
          minDiscountPercentage = Math.round(((minPrice - minOfferPrice) / minPrice) * 100);
        }
        
        if (maxOfferPrice !== null && maxPrice > 0) {
          maxDiscountPercentage = Math.round(((maxPrice - maxOfferPrice) / maxPrice) * 100);
        }
        
        // Extract unique variations for the product
        const variations: Array<{ id: number, name: string, value: string }> = []
        if (product.product_variation_combinations && product.product_variation_combinations.length > 0) {
          product.product_variation_combinations.forEach(combo => {
            if (combo.variation_id_1 && combo.product_variations_product_variation_combinations_variation_id_1Toproduct_variations) {
              const { variation_id, variation_name, variation_value } = combo.product_variations_product_variation_combinations_variation_id_1Toproduct_variations
              variations.push({ id: variation_id, name: variation_name, value: variation_value })
            }
            if (combo.variation_id_2 && combo.product_variations_product_variation_combinations_variation_id_2Toproduct_variations) {
              const { variation_id, variation_name, variation_value } = combo.product_variations_product_variation_combinations_variation_id_2Toproduct_variations
              variations.push({ id: variation_id, name: variation_name, value: variation_value })
            }
            if (combo.variation_id_3 && combo.product_variations_product_variation_combinations_variation_id_3Toproduct_variations) {
              const { variation_id, variation_name, variation_value } = combo.product_variations_product_variation_combinations_variation_id_3Toproduct_variations
              variations.push({ id: variation_id, name: variation_name, value: variation_value })
            }
          })
        }

        // Filter out duplicates
        const uniqueVariations = Array.from(
          new Map(variations.map(v => [`${v.name}-${v.value}`, v])).values()
        )

        // Log some useful information
        console.log('Product', product.product_id, 'variations:', 
          uniqueVariations.map(v => `${v.name}: ${v.value}`).join(', ')
        );

        return {
          id: product.product_id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          offerPrice: product.offer_price ? Number(product.offer_price) : null,
          offerStartDate: null,
          offerEndDate: product.offer_expiry ? new Date(product.offer_expiry).toISOString() : null,
          mainImage: product.main_image || '/images/placeholder.png',
          inventory: product.inventory || [{ quantity: 0 }],
          categoryId: product.category_id,
          category: {
            ...product.categories,
            id: product.category_id,
            parentCategory: null
          },
          sku: product.sku || '',
          specifications: product.product_specifications || [],
          // Set hasVariations flag based on whether the product has any variation combinations
          hasVariations: product.product_variation_combinations && product.product_variation_combinations.length > 0,
          // Add price range information
          priceRange: {
            min: minPrice,
            max: maxPrice,
            minOffer: minOfferPrice,
            maxOffer: maxOfferPrice,
            minDiscount: minDiscountPercentage,
            maxDiscount: maxDiscountPercentage
          },
          variations: uniqueVariations,
          variationCombinations: product.product_variation_combinations.map(combo => ({
            id: combo.combination_id,
            price: combo.price,
            offerPrice: combo.offer_price,
            stockQuantity: combo.stock_quantity,
            variation1: combo.variation_id_1 ? combo.product_variations_product_variation_combinations_variation_id_1Toproduct_variations : null,
            variation2: combo.variation_id_2 ? combo.product_variations_product_variation_combinations_variation_id_2Toproduct_variations : null,
            variation3: combo.variation_id_3 ? combo.product_variations_product_variation_combinations_variation_id_3Toproduct_variations : null
          }))
        }
      })

      return NextResponse.json({
        category,
        products: transformedProducts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        availableVariations: variationsForFiltering
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Database error while fetching products', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching category products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category products', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 