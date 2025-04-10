import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const productId = parseInt(searchParams.get('productId') || '0');
    const quantity = parseInt(searchParams.get('quantity') || '1');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Find applicable product rule based on quantity
    const applicableRule = await prisma.product_reward_rules.findFirst({
      where: {
        product_id: productId,
        min_quantity: { lte: quantity },
        OR: [
          { max_quantity: null },
          { max_quantity: { gte: quantity } }
        ]
      },
      orderBy: {
        min_quantity: 'desc'
      }
    });

    if (!applicableRule) {
      // If no product-specific rule, check for order amount rule (default rule)
      const defaultRule = await prisma.reward_point_rules.findFirst({
        where: {
          name: 'Default Order Points',
          is_active: true
        },
        include: {
          order_amount_reward_rules: true
        }
      });

      if (defaultRule && defaultRule.order_amount_reward_rules.length > 0) {
        const amountRule = defaultRule.order_amount_reward_rules[0];
        
        // Return the default rule information
        return NextResponse.json({
          rule: {
            id: amountRule.rule_id,
            pointsPerUnit: amountRule.points,
            bonusPoints: 0,
            isPercentage: amountRule.is_percentage,
            minQuantity: 1,
            maxQuantity: null,
            ruleType: 'amount'
          }
        });
      }

      // No rule found
      return NextResponse.json({ rule: null });
    }

    // Format the rule for the frontend
    const rule = {
      id: applicableRule.rule_id,
      pointsPerUnit: applicableRule.points_per_unit,
      bonusPoints: applicableRule.bonus_points || 0,
      isPercentage: applicableRule.is_percentage,
      minQuantity: applicableRule.min_quantity,
      maxQuantity: applicableRule.max_quantity,
      ruleType: 'product'
    };

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error fetching reward rules:', error);
    return NextResponse.json({ error: 'Failed to fetch reward rules' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 