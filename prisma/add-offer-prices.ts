import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to add offer prices...');
  
  // Get all categories
  const categories = await prisma.category.findMany();
  
  for (const category of categories) {
    console.log(`Adding offer prices to products in category: ${category.name}`);
    
    // Get 5 random products from each category
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id
      },
      take: 5,
      orderBy: {
        id: 'desc'
      }
    });
    
    for (const product of products) {
      // Calculate a discount between 10% and 30%
      const discountPercent = Math.floor(Math.random() * 20) + 10;
      const offerPrice = parseFloat((product.price * (1 - discountPercent / 100)).toFixed(2));
      
      // Set offer start date to today
      const today = new Date();
      
      // Set offer end date to 7-30 days from now
      const daysToAdd = Math.floor(Math.random() * 23) + 7;
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + daysToAdd);
      
      // Update the product with offer price and dates
      await prisma.product.update({
        where: {
          id: product.id
        },
        data: {
          offerPrice,
          offerStartDate: today,
          offerEndDate: endDate
        }
      });
      
      console.log(`Added offer price to ${product.name}: $${offerPrice} (${discountPercent}% off). Valid until ${endDate.toLocaleDateString()}`);
    }
  }
  
  console.log('Offer prices have been added successfully!');
}

main()
  .catch((e) => {
    console.error('Error adding offer prices:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 