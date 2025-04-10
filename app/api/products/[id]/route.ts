import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Context = {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    // Get the params object and immediately extract the ID
    const { params } = context;
    const id = parseInt(params.id)

    // First get all combinations for this product
    const combinations = await prisma.product_variation_combinations.findMany({
      where: {
        product_id: id
      },
      select: {
        combination_id: true,
        variation_id_1: true,
        variation_id_2: true,
        variation_id_3: true,
        price: true,
        offer_price: true,
        offer_expiry: true,
        stock_quantity: true,
        image_url: true
      }
    })

    // Get unique variation IDs from combinations
    const variationIds = new Set<number>()
    combinations.forEach(combo => {
      if (combo.variation_id_1) variationIds.add(combo.variation_id_1)
      if (combo.variation_id_2) variationIds.add(combo.variation_id_2)
      if (combo.variation_id_3) variationIds.add(combo.variation_id_3)
    })

    // Get all variations based on the IDs from combinations
    const variations = await prisma.product_variations.findMany({
      where: {
        variation_id: {
          in: Array.from(variationIds)
        }
      },
      select: {
        variation_id: true,
        variation_name: true,
        variation_value: true
      }
    })

    // Get the product details
    const product = await prisma.products.findUnique({
      where: {
        product_id: id
      },
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
            category_id: true,
            category_name: true,
            slug: true,
            categories: {
              select: {
                category_id: true,
                category_name: true,
                slug: true
              }
            },
            products: {
              where: {
                product_id: {
                  not: id
                }
              },
              select: {
                product_id: true,
                name: true,
                price: true,
                main_image: true
              },
              take: 8
            }
          }
        },
        brands: {
          select: {
            brand_id: true,
            brand_name: true
          }
        },
        warranties: {
          select: {
            warranty_id: true,
            warranty_name: true,
            duration_months: true,
            description: true
          }
        },
        product_specifications: {
          select: {
            specification_name: true,
            specification_value: true
          }
        },
        product_reward_rules: {
          select: {
            rule_id: true,
            points_per_unit: true,
            is_percentage: true,
            percentage_multiplier: true,
            reward_rule_id: true,
            reward_point_rules: {
              select: {
                name: true,
                description: true,
                is_active: true
              }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform the response to match the expected format
    const transformedProduct = {
      id: product.product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      offerPrice: product.offer_price,
      offerExpiry: product.offer_expiry,
      sku: product.sku,
      mainImage: product.main_image,
      inventory: product.inventory,
      categoryId: product.category_id,
      category: product.categories ? {
        id: product.categories.category_id,
        name: product.categories.category_name,
        slug: product.categories.slug,
        parentCategory: product.categories.categories ? {
          id: product.categories.categories.category_id,
          name: product.categories.categories.category_name,
          slug: product.categories.categories.slug
        } : null,
        products: product.categories.products?.map(p => ({
          id: p.product_id,
          name: p.name,
          price: p.price,
          mainImage: p.main_image
        }))
      } : null,
      brand: product.brands ? {
        id: product.brands.brand_id,
        name: product.brands.brand_name
      } : null,
      warranty: product.warranties ? {
        id: product.warranties.warranty_id,
        name: product.warranties.warranty_name,
        duration: product.warranties.duration_months,
        description: product.warranties.description
      } : null,
      specifications: product.product_specifications?.map(spec => ({
        name: spec.specification_name,
        value: spec.specification_value
      }))
    }

    // Transform variations
    const transformedVariations = variations.map(v => ({
      id: v.variation_id,
      name: v.variation_name,
      value: v.variation_value
    }))

    // Transform combinations
    const transformedCombinations = combinations.map(c => ({
      id: c.combination_id,
      variationId1: c.variation_id_1,
      variationId2: c.variation_id_2,
      variationId3: c.variation_id_3,
      price: c.price,
      offerPrice: c.offer_price,
      offerExpiry: c.offer_expiry,
      stockQuantity: c.stock_quantity,
      imageUrl: c.image_url
    }))

    // Calculate reward points information
    let rewardPointsInfo = null;
    if (product.product_reward_rules && product.product_reward_rules.length > 0) {
      const rule = product.product_reward_rules[0];
      const basePrice = product.offer_price || product.price || 0;
      
      // Calculate base points first
      let basePointsDescription = '';
      let estimatedPoints = 0;
      
      if (rule.is_percentage && rule.percentage_multiplier) {
        // Percentage of price
        const percentage = Number(rule.percentage_multiplier) * 100;
        estimatedPoints = Math.floor(Number(basePrice) * Number(rule.percentage_multiplier));
        basePointsDescription = `${percentage}% of product price`;
      } else if (rule.points_per_unit) {
        // Fixed points per unit
        estimatedPoints = rule.points_per_unit;
        basePointsDescription = `${rule.points_per_unit} points per item`;
      }
      
      // Create a comprehensive description
      let pointsDescription = basePointsDescription;
      if (rule.bonus_points && rule.bonus_points > 0) {
        pointsDescription += `. ${rule.bonus_points} bonus points for purchase.`;
      }
      
      rewardPointsInfo = {
        ruleId: rule.rule_id,
        basePointsPerUnit: estimatedPoints,
        description: pointsDescription,
        isActive: rule.reward_point_rules?.is_active || false,
        bonusPoints: rule.bonus_points || 0
      };
    }

    // Combine the data
    const response = {
      ...transformedProduct,
      variations: transformedVariations,
      combinations: transformedCombinations,
      hasVariations: transformedVariations && transformedVariations.length > 0,
      rewardPointsInfo
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: Context
) {
  try {
    const productId = parseInt(context.params.id, 10)
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const body = await request.json()
    const { variations } = body

    // Update the product with new variations
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        variations: variations
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product variations:', error)
    return NextResponse.json(
      { error: 'Failed to update product variations' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: Context
) {
  try {
    const productId = parseInt(context.params.id, 10)
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // First get all variations for this product
    const variations = await prisma.productVariation.findMany({
      where: {
        productId: productId,
        isActive: true
      },
      include: {
        options: {
          include: {
            option: true
          }
        }
      }
    })

    // Create a map to track unique variations by option name and value
    const uniqueVariationsMap = new Map()
    const duplicatesToDelete = []

    // Process each variation
    variations.forEach(variation => {
      // Get all options for this variation
      const options = variation.options.map(opt => ({
        name: opt.option.name,
        value: opt.value
      }))

      // Create a unique key for this combination of options
      const key = options.map(opt => `${opt.name}:${opt.value}`).join('|')

      // If we've seen this combination before, mark for deletion
      if (uniqueVariationsMap.has(key)) {
        duplicatesToDelete.push(variation.id)
      } else {
        uniqueVariationsMap.set(key, variation)
      }
    })

    // Delete duplicate variations
    if (duplicatesToDelete.length > 0) {
      await prisma.productVariation.deleteMany({
        where: {
          id: {
            in: duplicatesToDelete
          }
        }
      })
    }

    return NextResponse.json({
      message: `Deleted ${duplicatesToDelete.length} duplicate variations`
    })
  } catch (error) {
    console.error('Error deleting duplicate variations:', error)
    return NextResponse.json(
      { error: 'Failed to delete duplicate variations' },
      { status: 500 }
    )
  }
} 