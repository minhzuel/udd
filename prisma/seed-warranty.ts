import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWarranties() {
  console.log('Seeding warranties...');
  
  const warranties = [
    {
      name: 'Standard Warranty',
      duration: 12,
      description: '1 year standard warranty covering manufacturing defects'
    },
    {
      name: 'Extended Warranty',
      duration: 24,
      description: '2 years extended warranty with comprehensive coverage'
    },
    {
      name: 'Premium Warranty',
      duration: 36,
      description: '3 years premium warranty with full coverage and priority support'
    },
    {
      name: 'Basic Warranty',
      duration: 6,
      description: '6 months basic warranty covering essential components'
    },
    {
      name: 'Lifetime Warranty',
      duration: 1200, // 100 years
      description: 'Lifetime warranty with comprehensive coverage and premium support'
    }
  ];

  for (const warranty of warranties) {
    try {
      await prisma.warranty.create({
        data: warranty
      });
      console.log(`Created warranty: ${warranty.name}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`Warranty ${warranty.name} already exists`);
      } else {
        console.error(`Error with warranty ${warranty.name}:`, error);
      }
    }
  }

  // Get all products
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products total`);

  // Get all warranties
  const createdWarranties = await prisma.warranty.findMany();
  console.log(`Found ${createdWarranties.length} warranties`);

  // Assign random warranties to products
  for (const product of products) {
    const randomWarranty = createdWarranties[Math.floor(Math.random() * createdWarranties.length)];
    
    try {
      await prisma.product.update({
        where: {
          id: product.id
        },
        data: {
          warranty: {
            connect: {
              id: randomWarranty.id
            }
          }
        }
      });
      console.log(`Assigned ${randomWarranty.name} to product ${product.id}`);
    } catch (error) {
      console.error(`Error updating product ${product.id}:`, error);
    }
  }

  console.log('Warranties seeded and assigned successfully!');
}

seedWarranties()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 