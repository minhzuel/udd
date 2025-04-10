import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Extract and validate params in a way that works with Next.js route handlers
    const { id } = context.params;
    console.log(`[Rewards API] Fetching reward rules for product ID: ${id}`);
    
    // Validate product ID
    const productId = parseInt(id);
    if (isNaN(productId)) {
      console.log(`[Rewards API] Invalid product ID: ${id}`);
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // First, try to find product-specific reward rules
    let rewardRules = await prisma.product_reward_rules.findMany({
      where: {
        product_id: productId,
      },
      orderBy: {
        min_quantity: 'asc',
      },
    });

    console.log(`[Rewards API] Found ${rewardRules.length} product-specific reward rules`);

    // If no product-specific rules, try to find category-based rules
    if (rewardRules.length === 0) {
      // Get the product's category ID
      const product = await prisma.products.findUnique({
        where: {
          product_id: productId,
        },
        select: {
          category_id: true,
        },
      });

      if (product?.category_id) {
        // Look for category-based reward rules
        rewardRules = await prisma.product_reward_rules.findMany({
          where: {
            category_id: product.category_id,
          },
          orderBy: {
            min_quantity: 'asc',
          },
        });
        
        console.log(`[Rewards API] Found ${rewardRules.length} category-based reward rules`);
      }
    }

    // If still no rules, return default rules
    if (rewardRules.length === 0) {
      console.log(`[Rewards API] No reward rules found, returning default rules`);
      return NextResponse.json([
        {
          rule_id: 0,
          min_quantity: 1,
          max_quantity: 2,
          points_per_unit: 5,
          bonus_points: 0,
          is_percentage: false,
          percentage_multiplier: 1,
        },
        {
          rule_id: 0,
          min_quantity: 3,
          max_quantity: 9,
          points_per_unit: 5,
          bonus_points: 15,
          is_percentage: false,
          percentage_multiplier: 1,
        },
        {
          rule_id: 0,
          min_quantity: 10,
          max_quantity: null,
          points_per_unit: 5,
          bonus_points: 25,
          is_percentage: false,
          percentage_multiplier: 1,
        }
      ]);
    }

    // Format the reward rules for the frontend
    const formattedRules = rewardRules.map(rule => ({
      rule_id: rule.rule_id,
      min_quantity: rule.min_quantity || 1,
      max_quantity: rule.max_quantity,
      points_per_unit: rule.points_per_unit || 0,
      bonus_points: rule.bonus_points || 0,
      is_percentage: rule.is_percentage || false,
      percentage_multiplier: rule.percentage_multiplier || 1,
    }));

    console.log(`[Rewards API] Returning ${formattedRules.length} reward rules`);
    return NextResponse.json(formattedRules);
  } catch (error) {
    console.error('[Rewards API] Error fetching reward rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reward rules' },
      { status: 500 }
    );
  }
} 