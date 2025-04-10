const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting category image update...');

  // Update all categories to use the same image
  const targetImagePath = '/categories/category.png';
  
  // Get all categories
  const categories = await prisma.category.findMany();
  console.log(`Updating ${categories.length} categories...`);

  // Update each category with the specified image path
  for (const category of categories) {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        imageUrl: targetImagePath
      }
    });
  }
  
  console.log('✅ Updated all category images successfully!');
}

main()
  .catch((e) => {
    console.error('Error updating category images:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 