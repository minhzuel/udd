import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting shipping methods seed...')

    // Get the current structure of the shipping_methods table
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'shipping_methods'
    `
    
    console.log('Shipping methods table structure:', tableInfo)

    // Clear existing shipping methods
    await prisma.$executeRaw`DELETE FROM shipping_methods`
    console.log('Cleared existing shipping methods')

    // Insert the shipping methods using raw SQL
    await prisma.$executeRaw`
      INSERT INTO shipping_methods (shipping_method_id, name, description, base_cost, is_active)
      VALUES 
        (1, 'Inside Dhaka', 'Delivery within Dhaka city', 80, true),
        (2, 'Outside Dhaka', 'Delivery to locations outside Dhaka', 120, true),
        (3, 'Subarban', 'Delivery to suburban areas', 90, true),
        (4, 'Chittagong', 'Delivery to Chittagong', 110, true)
    `

    console.log('Shipping methods added successfully')
  } catch (error) {
    console.error('Error seeding shipping methods:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 