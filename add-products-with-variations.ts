import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Maps category types to their appropriate variations
const categoryVariationMapping = {
  'Smartphones': ['Color', 'Memory Size', 'RAM Size', 'Screen Size', 'Camera'],
  'Laptops': ['Color', 'Memory Size', 'RAM Size', 'Screen Size', 'Processor'],
  'Tablets': ['Color', 'Memory Size', 'Screen Size', 'Connectivity'],
  'Smart Watches': ['Color', 'Size', 'Material', 'Connectivity'],
  'Headphones': ['Color', 'Connectivity', 'Material'],
  'TVs': ['Screen Size', 'Resolution', 'Color'],
  'Home Audio': ['Color', 'Power', 'Connectivity'],
  'Smart Home': ['Color', 'Power', 'Connectivity'],
  'Computer Components': ['Color', 'Size', 'Power'],
  'Monitors': ['Screen Size', 'Resolution', 'Color'],
  'Storage': ['Memory Size', 'Color'],
  'Gaming Consoles': ['Color', 'Memory Size'],
  'PC Gaming': ['Color', 'Size', 'Power'],
  'Cameras': ['Color', 'Resolution', 'Battery'],
  'Camera Accessories': ['Color', 'Size', 'Material'],
  'Drones': ['Color', 'Camera', 'Battery'],
  'Printers': ['Color', 'Resolution'],
  'Networking': ['Color', 'Connectivity'],
  'Wearable Tech': ['Color', 'Size', 'Battery'],
  'Power & Batteries': ['Power', 'Size', 'Color']
}

// Function to generate price
const generatePrice = () => faker.number.int({ min: 1000, max: 50000 })

// Function to generate discounted price (75% products will have offer price)
const generateOfferPrice = (basePrice: number) => {
  if (Math.random() > 0.25) {
    const discountPercentage = faker.number.int({ min: 5, max: 25 }) / 100
    return Math.round(basePrice * (1 - discountPercentage))
  }
  return null
}

async function main() {
  console.log('Starting to seed products with variations...')
  
  // Get all categories
  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: Object.keys(categoryVariationMapping).map(name => 
          name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
        )
      }
    }
  })
  
  console.log(`Found ${categories.length} categories for seeding`)
  
  // For each category
  for (const category of categories) {
    console.log(`\nProcessing category: ${category.name}`)
    
    // Get variation types for this category
    const variationTypes = categoryVariationMapping[category.name as keyof typeof categoryVariationMapping] || 
                         categoryVariationMapping['Smart Home'] // Default fallback if not found
    
    // Get variations for this category's selected types
    const variations = await prisma.productVariation.findMany({
      where: {
        name: { in: variationTypes }
      }
    })
    
    // Group variations by name
    const variationsByType: Record<string, typeof variations> = {}
    variations.forEach(variation => {
      if (!variationsByType[variation.name]) {
        variationsByType[variation.name] = []
      }
      variationsByType[variation.name].push(variation)
    })
    
    // Create 20 products for this category
    for (let i = 0; i < 20; i++) {
      // Base product price and details
      const basePrice = generatePrice()
      const offerPrice = generateOfferPrice(basePrice)
      const productName = `${category.name} ${faker.commerce.productName()} ${i + 1}`
      const sku = `${category.name.substring(0, 3).toUpperCase()}-${faker.string.alphanumeric(5).toUpperCase()}`
      const slug = productName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      
      // Create the product
      const product = await prisma.product.create({
        data: {
          name: productName,
          sku,
          description: faker.commerce.productDescription(),
          price: basePrice,
          offerPrice,
          offerExpiry: offerPrice ? faker.date.future() : null,
          weight: faker.number.float({ min: 0.1, max: 10, precision: 0.01 }),
          length: faker.number.float({ min: 5, max: 100, precision: 0.01 }),
          width: faker.number.float({ min: 5, max: 100, precision: 0.01 }),
          height: faker.number.float({ min: 1, max: 50, precision: 0.01 }),
          categoryId: category.id,
          productType: 'physical',
          cost: Math.round(basePrice * 0.6),
          metaTitle: `${productName} - Best Price and Quality`,
          metaDescription: `Shop ${productName} at the best price with free shipping and warranty.`,
          slug: `${slug}-${Date.now()}`, // Ensure unique slug
          warrantyId: faker.number.int({ min: 1, max: 3 }),
          mainImage: `https://picsum.photos/seed/${sku}/800/800`,
        }
      })
      
      // Create product image
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: `https://picsum.photos/seed/${sku}/800/800`,
          isMain: true
        }
      })
      
      // Add a few more product images
      for (let j = 0; j < 3; j++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: `https://picsum.photos/seed/${sku}-${j}/800/800`,
            isMain: false
          }
        })
      }
      
      // Create inventory entry
      await prisma.inventory.create({
        data: {
          product: {
            connect: {
              id: product.id
            }
          },
          quantity: faker.number.int({ min: 10, max: 100 }),
          reorderLevel: faker.number.int({ min: 5, max: 20 })
        }
      })
      
      // Create product specifications
      await prisma.productSpecification.createMany({
        data: [
          {
            productId: product.id,
            name: "Material",
            value: faker.helpers.arrayElement(["Metal", "Plastic", "Wood", "Fabric", "Ceramic", "Glass"])
          },
          {
            productId: product.id,
            name: "Brand",
            value: faker.company.name()
          },
          {
            productId: product.id,
            name: "Origin",
            value: faker.location.country()
          },
          {
            productId: product.id,
            name: "Warranty",
            value: faker.helpers.arrayElement(["1 Year", "2 Years", "3 Years", "5 Years"])
          }
        ]
      })
      
      // Connect variations to product
      // Select up to 3 variation types for this product
      const selectedVariationTypes = faker.helpers.arrayElements(
        variationTypes,
        Math.min(3, variationTypes.length)
      )
      
      // Connect these variations to the product
      for (const type of selectedVariationTypes) {
        if (variationsByType[type] && variationsByType[type].length > 0) {
          const randomVariations = faker.helpers.arrayElements(
            variationsByType[type],
            Math.min(3, variationsByType[type].length)
          )
          
          for (const variation of randomVariations) {
            await prisma.$executeRaw`
              INSERT INTO "_ProductToVariation" ("A", "B")
              VALUES (${product.id}, ${variation.id})
              ON CONFLICT DO NOTHING
            `
          }
        }
      }
      
      // Create variation combinations
      // For each product, create combinations of variations
      // Get the connected variations for this product
      if (selectedVariationTypes.length > 0) {
        // For simple case - use first type as primary variation
        const type1 = selectedVariationTypes[0]
        const variations1 = variationsByType[type1] || []
        
        // Create combinations
        if (variations1.length > 0) {
          if (selectedVariationTypes.length >= 2) {
            // Use second type as secondary variation
            const type2 = selectedVariationTypes[1]
            const variations2 = variationsByType[type2] || []
            
            if (variations2.length > 0) {
              if (selectedVariationTypes.length >= 3) {
                // Use third type as tertiary variation
                const type3 = selectedVariationTypes[2]
                const variations3 = variationsByType[type3] || []
                
                if (variations3.length > 0) {
                  // Create combinations with 3 variations
                  for (const var1 of variations1.slice(0, 2)) {
                    for (const var2 of variations2.slice(0, 2)) {
                      for (const var3 of variations3.slice(0, 2)) {
                        const combinationPrice = Math.round(basePrice * (1 + Math.random() * 0.2 - 0.1)) // +/- 10%
                        const combinationOfferPrice = offerPrice 
                          ? Math.round(offerPrice * (1 + Math.random() * 0.2 - 0.1))
                          : null
                          
                        try {
                          await prisma.productVariationCombination.create({
                            data: {
                              productId: product.id,
                              variationId1: var1.id,
                              variationId2: var2.id,
                              variationId3: var3.id,
                              price: combinationPrice,
                              offerPrice: combinationOfferPrice,
                              offerExpiry: combinationOfferPrice ? faker.date.future() : null,
                              stockQuantity: faker.number.int({ min: 5, max: 50 }),
                              cost: Math.round(combinationPrice * 0.6),
                              imageUrl: `https://picsum.photos/seed/${sku}-${var1.value}-${var2.value}-${var3.value}/800/800`
                            }
                          })
                        } catch (error) {
                          console.log(`Error creating variation combination: ${error}`)
                        }
                      }
                    }
                  }
                }
              } else {
                // Create combinations with 2 variations
                for (const var1 of variations1.slice(0, 3)) {
                  for (const var2 of variations2.slice(0, 3)) {
                    const combinationPrice = Math.round(basePrice * (1 + Math.random() * 0.2 - 0.1)) // +/- 10%
                    const combinationOfferPrice = offerPrice 
                      ? Math.round(offerPrice * (1 + Math.random() * 0.2 - 0.1))
                      : null
                      
                    try {
                      await prisma.productVariationCombination.create({
                        data: {
                          productId: product.id,
                          variationId1: var1.id,
                          variationId2: var2.id,
                          price: combinationPrice,
                          offerPrice: combinationOfferPrice,
                          offerExpiry: combinationOfferPrice ? faker.date.future() : null,
                          stockQuantity: faker.number.int({ min: 5, max: 50 }),
                          cost: Math.round(combinationPrice * 0.6),
                          imageUrl: `https://picsum.photos/seed/${sku}-${var1.value}-${var2.value}/800/800`
                        }
                      })
                    } catch (error) {
                      console.log(`Error creating variation combination: ${error}`)
                    }
                  }
                }
              }
            }
          } else {
            // Create combinations with 1 variation
            for (const var1 of variations1.slice(0, 5)) {
              const combinationPrice = Math.round(basePrice * (1 + Math.random() * 0.2 - 0.1)) // +/- 10%
              const combinationOfferPrice = offerPrice 
                ? Math.round(offerPrice * (1 + Math.random() * 0.2 - 0.1))
                : null
                
              try {
                await prisma.productVariationCombination.create({
                  data: {
                    productId: product.id,
                    variationId1: var1.id,
                    price: combinationPrice,
                    offerPrice: combinationOfferPrice,
                    offerExpiry: combinationOfferPrice ? faker.date.future() : null,
                    stockQuantity: faker.number.int({ min: 5, max: 50 }),
                    cost: Math.round(combinationPrice * 0.6),
                    imageUrl: `https://picsum.photos/seed/${sku}-${var1.value}/800/800`
                  }
                })
              } catch (error) {
                console.log(`Error creating variation combination: ${error}`)
              }
            }
          }
        }
      }
      
      console.log(`Created product ${i+1}/20: ${product.name}`)
    }
    
    console.log(`Completed adding 20 products to category: ${category.name}`)
  }
  
  console.log('\nProducts with variations seeding completed successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 