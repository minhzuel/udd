// Simplified reward points service
import prisma from '@/lib/prisma';

/**
 * Simple function to add reward points for an order
 */
export async function addRewardPointsForOrder(userId, orderId, orderAmount, orderItems) {
  try {
    // Validate inputs
    if (!userId || userId <= 0) {
      console.error(`Invalid user ID: ${userId}`);
      return null;
    }

    if (!orderId || orderId <= 0) {
      console.error(`Invalid order ID: ${orderId}`);
      return null;
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      console.error('No order items provided for reward points calculation');
      return null;
    }

    // Convert IDs to integers to ensure correct type
    const userIdInt = parseInt(userId, 10);
    const orderIdInt = parseInt(orderId, 10);
    
    console.log(`Adding simple reward points for order #${orderIdInt}, user #${userIdInt}`);

    // Simple calculation
    // 5 points per item plus quantity bonuses
    const productPoints = orderItems.map(item => {
      const basePoints = 5 * item.quantity;
      let bonusPoints = 0;
      
      // Add quantity bonus
      if (item.quantity >= 10) {
        bonusPoints = 25; // Bonus for 10+ items
      } else if (item.quantity >= 3) {
        bonusPoints = 15; // Bonus for 3-9 items
      }
      
      return {
        productId: item.productId,
        points: basePoints + bonusPoints,
        description: `${basePoints} base points + ${bonusPoints} bonus points`
      };
    });
    
    // 1% of order total as additional points
    const orderTotalPoints = Math.floor(orderAmount * 0.01);
    
    // Calculate total points
    const totalPoints = productPoints.reduce((acc, item) => acc + item.points, 0) + orderTotalPoints;
    
    console.log(`Total points calculated: ${totalPoints}`);
    
    // Set expiry date to 90 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90);
    
    // Check if a reward point already exists for this order to avoid duplicates
    const existingReward = await prisma.rewardPoint.findFirst({
      where: {
        userId: userIdInt,
        orderId: orderIdInt
      }
    });
    
    if (existingReward) {
      console.log(`Reward points already exist for order #${orderIdInt}, skipping creation`);
      return {
        rewardPointId: existingReward.id,
        totalPoints: existingReward.points,
        expiryDate: existingReward.expiryDate
      };
    }
    
    try {
      // Create the reward point record with camelCase field names for Prisma
      const rewardPoint = await prisma.rewardPoint.create({
        data: {
          userId: userIdInt,
          orderId: orderIdInt,
          points: totalPoints,
          earnedDate: new Date(),
          expiryDate,
          isUsed: false
        }
      });
      
      console.log(`Created reward point with ID: ${rewardPoint.id}`);
      
      // Create a single detail record with the total
      const rewardPointDetail = await prisma.reward_point_details.create({
        data: {
          reward_point_id: rewardPoint.id,
          points: totalPoints,
          points_description: `Order #${orderIdInt} reward points (${orderItems.length} items)`
        }
      });
      
      console.log(`Created reward point detail with ID: ${rewardPointDetail.detail_id}`);
      console.log(`Reward points successfully added for order #${orderIdInt}`);
      
      return {
        rewardPointId: rewardPoint.id,
        totalPoints,
        expiryDate
      };
    } catch (createError) {
      console.error('Error creating reward point:', createError);
      console.error('Error data:', JSON.stringify({
        userId: userIdInt,
        orderId: orderIdInt,
        points: totalPoints
      }));
      throw createError; // Rethrow to be caught by outer try/catch
    }
  } catch (error) {
    console.error('Error adding reward points:', error);
    console.error('Stack trace:', error.stack || 'No stack trace available');
    console.error('Error data:', JSON.stringify({
      userId,
      orderId,
      orderAmount,
      orderItemsCount: orderItems?.length ?? 0
    }));
    return null;
  }
} 