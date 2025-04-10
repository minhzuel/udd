import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to add reward points to all products...');

    // First, create a main reward rule
    const mainRule = await prisma.rewardPointRule.create({
      data: {
        name: 'Product Purchase Rewards',
        description: 'Earn points on every product purchase with bonus points for bulk purchases',
        isActive: true,
        priority: 10,
        startDate: null, // No start date, always active
        endDate: null, // No end date, always active
      }
    });

    console.log(`Created main reward rule with ID: ${mainRule.id}`);

    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
      }
    });

    console.log(`Found ${products.length} products to process`);

    // Create product reward rule for each product
    const results = await Promise.all(
      products.map(async (product) => {
        // Create the product reward rule
        const productRule = await prisma.productRewardRule.create({
          data: {
            rewardRuleId: mainRule.id,
            productId: product.id,
            pointsPerUnit: 5, // Base points per unit: 1 Unit = 5 Points
            minQuantity: 1,
            isPercentage: false,
            // Create quantity-based bonus rules
            productQuantityRules: {
              create: [
                {
                  minQuantity: 3,
                  maxQuantity: 9,
                  bonusPoints: 15 // 3 units = 30 points (3*5 + 15 bonus)
                },
                {
                  minQuantity: 10,
                  maxQuantity: null, // No upper limit
                  bonusPoints: 25 // 10 units = 75 points (10*5 + 25 bonus)
                }
              ]
            }
          }
        });

        return {
          productId: product.id, 
          productName: product.name,
          productSku: product.sku,
          ruleId: productRule.id
        };
      })
    );

    console.log(`Successfully added reward rules to ${results.length} products`);
    console.log('Sample of processed products:');
    console.log(results.slice(0, 5));

  } catch (error) {
    console.error('Error adding reward points:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Reward points added successfully!'))
  .catch((e) => {
    console.error('Error in main function:', e);
    process.exit(1);
  }); 