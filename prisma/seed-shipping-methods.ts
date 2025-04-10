import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const shippingMethods = [
    {
      name: 'Inside Dhaka',
      description: 'Delivery within Dhaka city',
      code: 'inside_dhaka',
      price: 80,
      isActive: true
    },
    {
      name: 'Outside Dhaka',
      description: 'Delivery to locations outside Dhaka',
      code: 'outside_dhaka',
      price: 120,
      isActive: true
    },
    {
      name: 'Subarban',
      description: 'Delivery to suburban areas',
      code: 'subarban',
      price: 90,
      isActive: true
    },
    {
      name: 'Chittagong',
      description: 'Delivery to Chittagong',
      code: 'chittagong',
      price: 110,
      isActive: true
    }
  ]

  console.log('Starting shipping methods seed...')

  // Clear existing shipping methods
  await prisma.shippingMethod.deleteMany({})
  console.log('Cleared existing shipping methods')

  // Insert new shipping methods
  for (const method of shippingMethods) {
    await prisma.shippingMethod.create({
      data: method
    })
    console.log(`Created shipping method: ${method.name}`)
  }

  console.log('Shipping methods seed completed')
}

main()
  .catch((e) => {
    console.error('Error seeding shipping methods:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 