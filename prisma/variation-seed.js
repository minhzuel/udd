const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting variation seed script...');
  
  // Use the first product or create a new one if needed
  const productId = 1;
  
  try {
    // First, create variations
    console.log('Creating variations...');
    const colorVariation1 = await prisma.productVariation.create({
      data: {
        name: 'Color',
        value: 'Red'
      }
    });
    
    const colorVariation2 = await prisma.productVariation.create({
      data: {
        name: 'Color',
        value: 'Blue'
      }
    });
    
    const sizeVariation1 = await prisma.productVariation.create({
      data: {
        name: 'Size',
        value: 'S'
      }
    });
    
    const sizeVariation2 = await prisma.productVariation.create({
      data: {
        name: 'Size',
        value: 'M'
      }
    });
    
    const sizeVariation3 = await prisma.productVariation.create({
      data: {
        name: 'Size',
        value: 'L'
      }
    });
    
    // Connect variations to the product
    console.log('Connecting variations to product...');
    await prisma.productToVariation.createMany({
      data: [
        { A: productId, B: colorVariation1.id },
        { A: productId, B: colorVariation2.id },
        { A: productId, B: sizeVariation1.id },
        { A: productId, B: sizeVariation2.id },
        { A: productId, B: sizeVariation3.id }
      ]
    });
    
    // Create variation combinations
    console.log('Creating variation combinations...');
    const combinations = [];
    
    // Red + S
    const combination1 = await prisma.productVariationCombination.create({
      data: {
        productId: productId,
        variationId1: colorVariation1.id,
        variationId2: sizeVariation1.id,
        price: 2999,
        stockQuantity: 10
      }
    });
    combinations.push(combination1);
    
    // Red + M
    const combination2 = await prisma.productVariationCombination.create({
      data: {
        productId: productId,
        variationId1: colorVariation1.id,
        variationId2: sizeVariation2.id,
        price: 3099,
        stockQuantity: 15
      }
    });
    combinations.push(combination2);
    
    // Red + L
    const combination3 = await prisma.productVariationCombination.create({
      data: {
        productId: productId,
        variationId1: colorVariation1.id,
        variationId2: sizeVariation3.id,
        price: 3199,
        stockQuantity: 8
      }
    });
    combinations.push(combination3);
    
    // Blue + S
    const combination4 = await prisma.productVariationCombination.create({
      data: {
        productId: productId,
        variationId1: colorVariation2.id,
        variationId2: sizeVariation1.id,
        price: 2999,
        stockQuantity: 12
      }
    });
    combinations.push(combination4);
    
    // Blue + M
    const combination5 = await prisma.productVariationCombination.create({
      data: {
        productId: productId,
        variationId1: colorVariation2.id,
        variationId2: sizeVariation2.id,
        price: 3099,
        stockQuantity: 18
      }
    });
    combinations.push(combination5);
    
    // Blue + L
    const combination6 = await prisma.productVariationCombination.create({
      data: {
        productId: productId,
        variationId1: colorVariation2.id,
        variationId2: sizeVariation3.id,
        price: 3199,
        stockQuantity: 5
      }
    });
    combinations.push(combination6);
    
    console.log('Variations and combinations created successfully!');
    console.log('Combinations:', combinations);
    
  } catch (error) {
    console.error('Error in seed script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 