// This script checks if there are any products in the database for a specific category
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Get all categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    console.log('Categories and product counts:');
    categories.forEach(category => {
      console.log(`- ${category.name} (${category.slug}): ${category._count.products} products`);
    });

    // Check if there are any products at all
    const totalProducts = await prisma.product.count();
    console.log(`\nTotal products in database: ${totalProducts}`);

    // Check if there are any products with inventory
    const productsWithInventory = await prisma.product.count({
      where: {
        inventory: {
          some: {
            quantity: {
              gt: 0
            }
          }
        }
      }
    });
    console.log(`Products with inventory > 0: ${productsWithInventory}`);

    // Check if there are any products on sale
    const productsOnSale = await prisma.product.count({
      where: {
        offerPrice: {
          not: null
        },
        offerExpiry: {
          gt: new Date()
        }
      }
    });
    console.log(`Products on sale: ${productsOnSale}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 