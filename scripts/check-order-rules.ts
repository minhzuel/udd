import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Fetching order amount reward rules from database...\n')
    
    // Get all order amount rules
    const orderRules = await prisma.orderAmountRewardRule.findMany({
      include: {
        rewardRule: true
      }
    })

    console.log(`Found ${orderRules.length} order amount rules:\n`)

    // Display rules
    for (const rule of orderRules) {
      console.log(`Rule ID: ${rule.id}`)
      console.log(`Reward Rule ID: ${rule.rewardRuleId}`)
      console.log(`Min Amount: $${rule.minAmount}`)
      
      if (rule.maxAmount) {
        console.log(`Max Amount: $${rule.maxAmount}`)
      } else {
        console.log(`Max Amount: No limit`)
      }
      
      if (rule.isPercentage) {
        console.log(`Points: ${rule.points}% of order total`)
      } else {
        console.log(`Points: ${rule.points} fixed points`)
      }
      
      if (rule.rewardRule) {
        console.log(`Rule Name: ${rule.rewardRule.name}`)
        console.log(`Rule Description: ${rule.rewardRule.description || 'No description'}`)
        console.log(`Active: ${rule.rewardRule.isActive ? 'Yes' : 'No'}`)
      }
      
      console.log('\n' + '-'.repeat(50) + '\n')
    }

  } catch (error) {
    console.error('Error retrieving order amount rules:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log('Order amount rules query completed'))
  .catch(e => console.error(e)) 