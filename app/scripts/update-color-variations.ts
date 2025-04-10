import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Map of standard color names with their hex values
const standardColors = {
  'red': '#FF0000',
  'blue': '#0000FF',
  'green': '#008000',
  'yellow': '#FFFF00',
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
  'navy': '#000080',
  'teal': '#008080',
  'maroon': '#800000',
  'olive': '#808000',
  'lime': '#00FF00',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'silver': '#C0C0C0',
  'gold': '#FFD700'
};

/**
 * Updates color variations to use standard color names
 */
async function updateColorVariations() {
  try {
    // Get all color variations
    const colorVariations = await prisma.productVariation.findMany({
      where: {
        name: {
          equals: 'Color',
          mode: 'insensitive' // Case insensitive search
        }
      },
      include: {
        product: {
          select: { 
            name: true,
            id: true
          }
        }
      }
    });

    console.log(`Found ${colorVariations.length} color variations`);

    // Group variations by product to check for duplicates
    const productVariations = new Map();
    
    // Fill the map with product variations
    for (const variation of colorVariations) {
      const key = variation.productId;
      if (!productVariations.has(key)) {
        productVariations.set(key, []);
      }
      productVariations.get(key).push(variation);
    }

    // Process each color variation
    for (const variation of colorVariations) {
      const currentValue = variation.value;
      
      // Convert to lowercase for matching
      const lowerValue = currentValue.toLowerCase();
      
      // Check if we need to update this value
      let newColor = null;
      
      // First try exact match
      if (lowerValue in standardColors) {
        newColor = capitalize(lowerValue);
      } else {
        // Try to find closest match
        const colorKeys = Object.keys(standardColors);
        for (const color of colorKeys) {
          if (lowerValue.includes(color) || color.includes(lowerValue)) {
            newColor = capitalize(color);
            break;
          }
        }
        
        // If no match found, assign a random standard color
        if (!newColor) {
          const randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
          newColor = capitalize(randomColor);
        }
      }
      
      // Update the variation if we have a new color and it's not a duplicate
      if (newColor && newColor.toLowerCase() !== lowerValue) {
        // Check if this color already exists for this product
        const productVars = productVariations.get(variation.productId) || [];
        const colorExists = productVars.some(v => 
          v.name.toLowerCase() === 'color' && 
          v.value.toLowerCase() === newColor.toLowerCase() &&
          v.id !== variation.id
        );
        
        if (colorExists) {
          console.log(`Skipping update from "${currentValue}" to "${newColor}" for product ${variation.product.name} - color already exists`);
          continue;
        }
        
        console.log(`Updating color from "${currentValue}" to "${newColor}" for product ${variation.product.name}`);
        
        try {
          await prisma.productVariation.update({
            where: { id: variation.id },
            data: { value: newColor }
          });
          
          // Update our local cache as well
          const vars = productVariations.get(variation.productId);
          const idx = vars.findIndex(v => v.id === variation.id);
          if (idx !== -1) {
            vars[idx].value = newColor;
          }
        } catch (error) {
          console.error(`Failed to update color "${currentValue}" to "${newColor}" for product ${variation.product.name}:`, error);
        }
      } else {
        console.log(`Keeping color "${currentValue}" (already standard) for product ${variation.product.name}`);
      }
    }
    
    console.log('Color variations update completed successfully!');
  } catch (error) {
    console.error('Error updating color variations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Execute the update function
updateColorVariations()
  .then(() => console.log('Script completed'))
  .catch(e => console.error('Script error:', e)); 