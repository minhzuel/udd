import prisma from '@/lib/prisma'

export interface RewardPointOptions {
  userId: number;
  orderId: number;
  orderAmount: number;
  orderItems: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
  }[];
}

export interface ProductPointCalculation {
  orderItemId: number;
  productId: number;
  points: number;
  description: string;
  ruleId?: number;
}

export interface OrderPointCalculation {
  points: number;
  description: string;
  ruleId?: number;
}

export interface RewardPointsResponse {
  totalPoints: number;
  details: RewardPointDetail[];
}

export interface RewardPointDetail {
  orderItemId?: number;
  productId?: number;
  points: number;
  description: string;
  ruleId?: number;
}

export interface ProductRewardRule {
  id: number;
  rewardRuleId: number;
  productId: number | null;
  categoryId: number | null;
  pointsPerUnit: number;
  minQuantity: number;
  maxQuantity: number | null;
  bonusPoints: number;
  isPercentage: boolean;
  percentageMultiplier: number;
  rewardRule: {
    id: number;
    name: string;
    isActive: boolean;
    priority: number;
  };
}

/**
 * Calculate and save reward points for an order
 */
export async function calculateAndSaveRewardPoints(options: RewardPointOptions): Promise<RewardPointsResponse | null> {
  const { userId, orderId, orderAmount, orderItems } = options;
  let totalPoints = 0;
  const details: RewardPointDetail[] = [];

  try {
    console.log(`Calculating reward points for user=${userId}, order=${orderId}, amount=${orderAmount}`);
    console.log(`Order has ${orderItems.length} items`);

    // Step 1: Calculate points from product-specific reward rules
    const productPoints = await calculateProductPoints(orderItems);
    
    if (productPoints && productPoints.length > 0) {
      // Accumulate product points
      for (const item of productPoints) {
        totalPoints += item.points;
        details.push(item);
      }
    }

    // Step 2: Calculate points based on order amount rules
    const orderAmountPoints = await calculateOrderAmountPoints(orderAmount);
    if (orderAmountPoints > 0) {
      totalPoints += orderAmountPoints;
      details.push({
        points: orderAmountPoints,
        description: `Order amount bonus points`,
        ruleId: null,
        orderItemId: null,
        productId: null
      });
    }

    // Step 3: If no points earned from rules, use fallback calculation to ensure some rewards
    if (totalPoints === 0) {
      console.log(`No points earned from rules, applying fallback calculation for order #${orderId}`);
      
      // Fallback: Give 1 point per $1 spent (1% of order total)
      const fallbackOrderPoints = Math.max(1, Math.floor(orderAmount * 0.01));
      totalPoints += fallbackOrderPoints;
      
      details.push({
        points: fallbackOrderPoints,
        description: `Default 1% of order total (${orderAmount})`,
        ruleId: null,
        orderItemId: null,
        productId: null
      });
      
      // Also give 5 points per product item as fallback
      for (const item of orderItems) {
        const itemPoints = 5 * item.quantity;
        totalPoints += itemPoints;
        
        details.push({
          orderItemId: item.id,
          productId: item.productId,
          points: itemPoints,
          description: `Default 5 points per item`,
          ruleId: null
        });
      }
    }

    // Step 4: Save the reward points to the database
    const now = new Date();
    // Set expiry date to 1 year from now
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    try {
      // Create the main reward point record
      const mainRewardPoint = await prisma.reward_points.create({
        data: {
          user_id: userId,
          order_id: orderId,
          points: totalPoints,
          earned_date: now,
          expiry_date: expiryDate,
          is_used: false
        }
      });

      // Create individual reward point detail records
      for (const detail of details) {
        await prisma.reward_point_details.create({
          data: {
            reward_point_id: mainRewardPoint.reward_point_id,
            order_item_id: detail.orderItemId || null,
            product_id: detail.productId || null,
            rule_id: detail.ruleId || null,
            points: detail.points,
            points_description: detail.description
          }
        });
      }

      console.log(`Successfully saved ${totalPoints} reward points for order #${orderId}`);
      return { totalPoints, details };
    } catch (dbError) {
      console.error('Database error saving reward points:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error in calculateAndSaveRewardPoints:', error);
    throw error; // Re-throw to allow caller to handle
  }
}

/**
 * Find the most applicable reward rule for a product
 */
async function findProductRewardRule(productId: number) {
  // Step 1: Look for product-specific rules
  const productRule = await prisma.product_reward_rules.findFirst({
    where: {
      product_id: productId
    }
  });
  
  if (productRule) {
    // Check if the associated reward rule is active
    const ruleIsActive = await prisma.reward_point_rules.findUnique({
      where: { 
        rule_id: productRule.reward_rule_id
      }
    });
    
    if (ruleIsActive && ruleIsActive.is_active) {
      console.log(`Found product rule for productId=${productId}: ruleId=${productRule.rule_id}`);
      return productRule;
    }
  }
  
  console.log(`No product rule found for productId=${productId}, checking category rules`);
  
  // Step 2: If no product-specific rule, look for category rules
  const product = await prisma.products.findUnique({
    where: { product_id: productId },
    select: { category_id: true }
  });
  
  if (!product) {
    console.log(`Product with ID ${productId} not found in database`);
    return null;
  }
  
  console.log(`Product categoryId=${product.category_id}`);
  
  if (!product.category_id) {
    return null;
  }
  
  // For category rules
  const categoryRule = await prisma.product_reward_rules.findFirst({
    where: {
      category_id: product.category_id
    }
  });
  
  if (categoryRule) {
    // Check if the associated reward rule is active
    const ruleIsActive = await prisma.reward_point_rules.findUnique({
      where: { 
        rule_id: categoryRule.reward_rule_id
      }
    });
    
    if (ruleIsActive && ruleIsActive.is_active) {
      console.log(`Found category rule for categoryId=${product.category_id}: ruleId=${categoryRule.rule_id}`);
      return categoryRule;
    }
  }
  
  console.log(`No category rule found for categoryId=${product.category_id}`);
  return null;
}

/**
 * Calculate reward points for each product in the order
 */
async function calculateProductPoints(orderItems: RewardPointOptions['orderItems']): 
  Promise<ProductPointCalculation[]> {
  
  const results: ProductPointCalculation[] = [];

  try {
    console.log(`Processing ${orderItems.length} items for product rewards`);
    
    for (const item of orderItems) {
      try {
        // Get the product information
        const productId = item.productId;
        const quantity = item.quantity;
        
        console.log(`Processing item with productId=${productId}, quantity=${quantity}`);
        
        // Find the most specific applicable rule for this product
        const rule = await findProductRewardRule(productId);
        
        if (!rule) {
          console.log(`No reward rule found for product ${productId}`);
          continue;
        }
        
        console.log(`Found rule: ruleId=${rule.rule_id}, isPercentage=${rule.isPercentage}`);
        
        // Calculate points based on the rule
        let pointsEarned = 0;
        let description = '';
        
        if (rule.isPercentage) {
          // Calculate points as a percentage of the item's price
          const percentageMultiplier = rule.percentageMultiplier || 1.0;
          pointsEarned = Math.floor((item.price * item.quantity) * percentageMultiplier);
          description = `${percentageMultiplier * 100}% of purchase amount as points`;
        } else {
          // Calculate points based on points per unit
          pointsEarned = (rule.pointsPerUnit || 0) * item.quantity;
          description = `${rule.pointsPerUnit} points per item`;
        }
        
        // Apply quantity-based bonus from the rule
        const bonusPoints = rule.bonusPoints || 0;
        console.log(`Adding ${bonusPoints} bonus points from tier rule`);
        pointsEarned += bonusPoints;
        
        console.log(`Points earned for productId=${item.productId}: ${pointsEarned}, description: ${description}`);
        
        if (pointsEarned > 0) {
          results.push({
            orderItemId: item.id,
            productId: item.productId,
            points: pointsEarned,
            description,
            ruleId: rule.reward_rule_id
          });
        }
      } catch (error) {
        console.error(`Error processing reward points for item ${item.productId}:`, error);
        // Continue with next item
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in calculateProductPoints:', error);
    return [];
  }
}

/**
 * Calculate reward points based on total order amount
 */
async function calculateOrderAmountPoints(orderAmount: number): Promise<number> {
  console.log(`Calculating order total points for amount: ${orderAmount}`);
  
  // Find applicable order amount rules
  const orderRule = await prisma.order_amount_reward_rules.findFirst({
    where: {
      min_amount: { lte: orderAmount },
      OR: [
        { max_amount: null },
        { max_amount: { gte: orderAmount } }
      ]
    },
    orderBy: {
      min_amount: 'desc' // Higher minimums first, to find the most specific rule
    }
  });
  
  if (!orderRule) {
    console.log(`No order total rule found for amount: ${orderAmount}`);
    return 0;
  }
  
  // Now check if the reward rule is active
  const rewardRule = await prisma.reward_point_rules.findUnique({
    where: {
      rule_id: orderRule.reward_rule_id
    }
  });
  
  if (!rewardRule || !rewardRule.is_active) {
    console.log(`Reward rule ${orderRule.reward_rule_id} is not active or doesn't exist`);
    return 0;
  }
  
  console.log(`Found order total rule: ruleId=${orderRule.rule_id}, minAmount=${orderRule.min_amount}, isPercentage=${orderRule.is_percentage}`);
  console.log(`Associated reward rule: ${rewardRule.name}, active: ${rewardRule.is_active}`);
  
  let pointsEarned = 0;
  let description = '';
  
  if (orderRule.is_percentage) {
    // Calculate points as a percentage of the order amount
    pointsEarned = Math.floor(orderAmount * orderRule.points / 100);
    description = `${orderRule.points}% of order total (${orderAmount}) as points`;
  } else {
    // Fixed points for the order
    pointsEarned = orderRule.points;
    description = `${orderRule.points} fixed points for order total`;
  }
  
  console.log(`Order total points earned: ${pointsEarned}, description: ${description}`);
  
  return pointsEarned;
}

/**
 * Get total available reward points for a user
 */
export async function getUserAvailablePoints(userId: number): Promise<number> {
  // Get all non-expired points that are not marked as used
  const availablePoints = await prisma.reward_points.findMany({
    where: {
      user_id: userId,
      OR: [
        // Include all valid non-expired positive points
        {
          is_used: false,
          expiry_date: {
            gt: new Date()
          },
          points: {
            gt: 0
          }
        },
        // Include all redemption records (negative points)
        {
          points: {
            lt: 0
          }
        }
      ]
    },
    select: {
      points: true
    }
  });
  
  // Sum all points (both earned and redeemed)
  const totalPoints = availablePoints.reduce((sum, point) => {
    return sum + (point.points || 0);
  }, 0);
  
  return Math.max(0, totalPoints); // Ensure we never return negative points
}

/**
 * Redeem reward points for a user
 */
export async function redeemRewardPoints(userId: number, pointsToRedeem: number, orderId?: number): Promise<boolean> {
  // Verify user has enough points
  const availablePoints = await getUserAvailablePoints(userId);
  
  if (availablePoints < pointsToRedeem) {
    throw new Error(`User only has ${availablePoints} points available`);
  }
  
  // Redeem points, oldest first (FIFO)
  const pointsToFind = await prisma.reward_points.findMany({
    where: {
      user_id: userId,
      is_used: false,
      expiry_date: {
        gt: new Date()
      }
    },
    orderBy: {
      earned_date: 'asc'
    }
  });
  
  let remainingPointsToRedeem = pointsToRedeem;
  const updatedPointIds: number[] = [];
  
  for (const point of pointsToFind) {
    if (remainingPointsToRedeem <= 0) break;
    
    const currentPoints = point.points || 0;
    
    if (currentPoints <= remainingPointsToRedeem) {
      // This reward point will be fully used
      updatedPointIds.push(point.reward_point_id);
      remainingPointsToRedeem -= currentPoints;
    } else {
      // This reward point will be partially used
      // We'll update it later with the remaining balance
      await prisma.reward_points.update({
        where: { reward_point_id: point.reward_point_id },
        data: {
          points: currentPoints - remainingPointsToRedeem
        }
      });
      remainingPointsToRedeem = 0;
    }
  }
  
  // Mark fully used points as redeemed
  if (updatedPointIds.length > 0) {
    await prisma.reward_points.updateMany({
      where: {
        reward_point_id: { in: updatedPointIds }
      },
      data: {
        is_used: true
      }
    });
  }
  
  // Create a record of the redemption if an order ID is provided
  if (orderId) {
    // Negative points to indicate redemption
    await prisma.reward_points.create({
      data: {
        user_id: userId,
        points: -pointsToRedeem,
        earned_date: new Date(),
        expiry_date: new Date(), // Expiry can be set to current date as this is a redemption
        order_id: orderId,
        is_used: true,
        reward_point_details: {
          create: {
            points: -pointsToRedeem,
            points_description: `Redeemed ${pointsToRedeem} points on order #${orderId}`
          }
        }
      }
    });
  }
  
  return true;
}