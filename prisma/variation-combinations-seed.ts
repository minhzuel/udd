import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define category-specific variations
const categoryVariations = {
  'Smartphones': {
    variations: [
      { name: 'Storage Capacity', values: ['128GB', '256GB', '512GB', '1TB'] },
      { name: 'RAM Size', values: ['8GB', '12GB', '16GB'] },
      { name: 'Color', values: ['Black', 'Silver', 'Gold', 'Space Gray', 'Midnight Black'] }
    ]
  },
  'Laptops': {
    variations: [
      { name: 'Storage Capacity', values: ['512GB', '1TB', '2TB'] },
      { name: 'RAM Size', values: ['8GB', '16GB', '32GB', '64GB'] },
      { name: 'Screen Size', values: ['13"', '14"', '15.6"', '17"'] }
    ]
  },
  'Smartwatches': {
    variations: [
      { name: 'Color', values: ['Black', 'Silver', 'Gold', 'Rose Gold'] },
      { name: 'Connectivity', values: ['Wi-Fi', 'Wi-Fi + Cellular'] },
      { name: 'Material', values: ['Aluminum', 'Stainless Steel', 'Titanium'] }
    ]
  },
  'Headphones': {
    variations: [
      { name: 'Color', values: ['Black', 'White', 'Blue', 'Silver'] },
      { name: 'Connectivity', values: ['Bluetooth', 'USB-C', 'Lightning'] }
    ]
  },
  'default': {
    variations: [
      { name: 'Color', values: ['Black', 'White', 'Silver'] },
      { name: 'Item Size', values: ['Small', 'Medium', 'Large'] }
    ]
  }
};

async function createVariationCombinations() {
  console.log('Starting to create variation combinations...');

  // Get all products with their categories
  const products = await prisma.product.findMany({
    include: {
      category: true
    }
  });

  // Get all variations
  const variations = await prisma.productVariation.findMany();

  for (const product of products) {
    console.log(`Creating variations for product: ${product.name}`);
    
    // Get category-specific variations or default ones
    const categoryConfig = categoryVariations[product.category?.name || ''] || categoryVariations.default;
    
    // Create 3-4 random combinations for each product
    const numCombinations = Math.floor(Math.random() * 2) + 3; // Random number between 3 and 4
    
    for (let i = 0; i < numCombinations; i++) {
      // Select variations for this combination
      const combinationVariations = categoryConfig.variations.map(varConfig => {
        const value = varConfig.values[Math.floor(Math.random() * varConfig.values.length)];
        return variations.find(v => v.name === varConfig.name && v.value === value);
      }).filter(v => v !== undefined);

      if (combinationVariations.length < 2) continue;

      // Calculate price adjustment based on variations
      const basePrice = Number(product.price);
      let priceAdjustment = 1.0;
      
      // Adjust price based on variations
      if (combinationVariations.some(v => v?.value?.includes('TB'))) {
        priceAdjustment += 0.3; // 30% more for TB storage
      }
      if (combinationVariations.some(v => v?.value?.includes('32GB') || v?.value?.includes('64GB'))) {
        priceAdjustment += 0.2; // 20% more for high RAM
      }
      if (combinationVariations.some(v => v?.value?.includes('Titanium'))) {
        priceAdjustment += 0.4; // 40% more for premium materials
      }

      const combinationPrice = basePrice * priceAdjustment;
      const combinationCost = combinationPrice * 0.6; // 40% margin

      try {
        await prisma.productVariationCombination.create({
          data: {
            productId: product.id,
            variationId1: combinationVariations[0]?.id || 0,
            variationId2: combinationVariations[1]?.id,
            variationId3: combinationVariations[2]?.id,
            stockQuantity: Math.floor(Math.random() * 50) + 10, // Random stock between 10 and 60
            price: combinationPrice,
            cost: combinationCost
          }
        });
      } catch (error) {
        console.error(`Error creating combination for product ${product.name}:`, error);
      }
    }
  }

  console.log('Finished creating variation combinations');
}

async function main() {
  await createVariationCombinations();
}

main()
  .catch((error) => {
    console.error('Error seeding variation combinations:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 