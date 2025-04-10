import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Fetching reward point rules from database...\n')
    
    // Get all reward rules
    const rewardRules = await prisma.rewardPointRule.findMany({
      include: {
        orderAmountRules: true,
        productRewardRules: {
          include: {
            productQuantityRules: true,
            product: {
              select: {
                name: true,
                sku: true
              }
            },
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    console.log(`Found ${rewardRules.length} reward rules:\n`)

    // Display rules
    for (const rule of rewardRules) {
      console.log(`Rule ID: ${rule.id}`)
      console.log(`Name: ${rule.name}`)
      console.log(`Description: ${rule.description || 'No description'}`)
      console.log(`Active: ${rule.isActive ? 'Yes' : 'No'}`)
      console.log(`Priority: ${rule.priority}`)
      
      // Order amount rules
      if (rule.orderAmountRules.length > 0) {
        console.log('\nOrder Amount Rules:')
        for (const orderRule of rule.orderAmountRules) {
          console.log(`  Min Amount: $${orderRule.minAmount}`)
          if (orderRule.maxAmount) {
            console.log(`  Max Amount: $${orderRule.maxAmount}`)
          } else {
            console.log(`  Max Amount: No limit`)
          }
          
          if (orderRule.isPercentage) {
            console.log(`  Points: ${orderRule.points}% of order total`)
          } else {
            console.log(`  Points: ${orderRule.points} fixed points`)
          }
        }
      }
      
      // Product rules
      if (rule.productRewardRules.length > 0) {
        console.log('\nProduct Rules:')
        for (const productRule of rule.productRewardRules) {
          if (productRule.productId) {
            console.log(`  Product: ${productRule.product?.name || 'Unknown'} (ID: ${productRule.productId})`)
          } else if (productRule.categoryId) {
            console.log(`  Category: ${productRule.category?.name || 'Unknown'} (ID: ${productRule.categoryId})`)
          }
          
          if (productRule.isPercentage) {
            console.log(`  Points: ${productRule.percentageMultiplier * 100}% of product price`)
          } else {
            console.log(`  Points Per Unit: ${productRule.pointsPerUnit}`)
          }
          
          // Quantity rules
          if (productRule.productQuantityRules.length > 0) {
            console.log('  Quantity Bonuses:')
            for (const quantityRule of productRule.productQuantityRules) {
              if (quantityRule.maxQuantity) {
                console.log(`    ${quantityRule.minQuantity}-${quantityRule.maxQuantity} units: +${quantityRule.bonusPoints} bonus points`)
              } else {
                console.log(`    ${quantityRule.minQuantity}+ units: +${quantityRule.bonusPoints} bonus points`)
              }
            }
          }
        }
      }
      
      console.log('\n' + '-'.repeat(50) + '\n')
    }

  } catch (error) {
    console.error('Error retrieving reward rules:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log('Reward rules query completed'))
  .catch(e => console.error(e)) 