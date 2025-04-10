import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to get random elements from an array
function getRandomElements(arr: string[], count: number): string[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

async function main() {
  console.log('Starting to add product variations...')

  // Get all products
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      variations: {
        include: {
          attributes: {
            include: {
              attribute: true
            }
          }
        }
      }
    }
  })

  console.log(`Found ${products.length} products`)

  // Define variation types and their values
  const variations = {
    electronics: {
      storage: ['64GB', '128GB', '256GB', '512GB', '1TB'],
      color: ['Black', 'Silver', 'Gold', 'Space Gray', 'Midnight Blue'],
      ram: ['4GB', '8GB', '16GB', '32GB'],
    },
    clothing: {
      size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      color: ['Black', 'White', 'Navy', 'Red', 'Green', 'Blue', 'Gray'],
      style: ['Regular Fit', 'Slim Fit', 'Loose Fit'],
    },
    furniture: {
      color: ['Natural', 'Walnut', 'Oak', 'White', 'Black', 'Gray'],
      size: ['Small', 'Medium', 'Large'],
      material: ['Wood', 'Metal', 'Glass', 'Plastic'],
    },
    default: {
      size: ['Small', 'Medium', 'Large'],
      color: ['Black', 'White', 'Silver', 'Blue', 'Red'],
      package: ['Standard', 'Premium', 'Deluxe'],
    },
  }

  // Process each product
  for (const product of products) {
    console.log(`\nProcessing product: ${product.name}`)

    // Skip if product already has variations
    if (product.variations && product.variations.length > 0) {
      console.log('Product already has variations, skipping...')
      continue
    }

    // Determine product type based on name or category
    const productType = product.name.toLowerCase()
    let variationType = 'default'

    if (productType.includes('phone') || productType.includes('laptop') || productType.includes('tablet')) {
      variationType = 'electronics'
    } else if (productType.includes('shirt') || productType.includes('pants') || productType.includes('dress')) {
      variationType = 'clothing'
    } else if (productType.includes('table') || productType.includes('chair') || productType.includes('desk')) {
      variationType = 'furniture'
    }

    const variationSet = variations[variationType]

    // Add variations based on product type
    try {
      // Add color variations
      for (const color of getRandomElements(variationSet.color, 3)) {
        // Create or find the color attribute
        const colorAttribute = await prisma.productAttribute.upsert({
          where: { name: 'Color' },
          update: {},
          create: {
            name: 'Color',
            attributeType: 'SELECT'
          }
        })

        // Create variation with upsert
        const variation = await prisma.productVariation.upsert({
          where: {
            productId_name_value: {
              productId: product.id,
              name: 'Color',
              value: color
            }
          },
          update: {},
          create: {
            productId: product.id,
            name: 'Color',
            value: color,
            stockValue: Math.floor(Math.random() * 20) + 5,
            isActive: true
          }
        })

        // Create variation attribute
        await prisma.variationAttribute.upsert({
          where: {
            variationId_attributeId_value: {
              variationId: variation.id,
              attributeId: colorAttribute.id,
              value: color
            }
          },
          update: {},
          create: {
            variationId: variation.id,
            attributeId: colorAttribute.id,
            value: color
          }
        })
      }

      // Add size variations
      if (variationSet.size) {
        const sizeAttribute = await prisma.productAttribute.upsert({
          where: { name: 'Size' },
          update: {},
          create: {
            name: 'Size',
            attributeType: 'SELECT'
          }
        })

        for (const size of getRandomElements(variationSet.size, 3)) {
          const priceAdjustment = variationType === 'clothing' ? 5 : 20
          const variation = await prisma.productVariation.upsert({
            where: {
              productId_name_value: {
                productId: product.id,
                name: 'Size',
                value: size
              }
            },
            update: {},
            create: {
              productId: product.id,
              name: 'Size',
              value: size,
              stockValue: Math.floor(Math.random() * 15) + 3,
              price: size === 'Small' ? null : Number(product.price) + priceAdjustment,
              isActive: true
            }
          })

          await prisma.variationAttribute.upsert({
            where: {
              variationId_attributeId_value: {
                variationId: variation.id,
                attributeId: sizeAttribute.id,
                value: size
              }
            },
            update: {},
            create: {
              variationId: variation.id,
              attributeId: sizeAttribute.id,
              value: size
            }
          })
        }
      }

      // Add specific variations based on type
      if (variationType === 'electronics') {
        // Add storage variations
        const storageAttribute = await prisma.productAttribute.upsert({
          where: { name: 'Storage' },
          update: {},
          create: {
            name: 'Storage',
            attributeType: 'SELECT'
          }
        })

        for (const storage of getRandomElements(variationSet.storage, 3)) {
          const storageGB = parseInt(storage)
          const priceIncrease = (storageGB / 64) * 50
          const variation = await prisma.productVariation.upsert({
            where: {
              productId_name_value: {
                productId: product.id,
                name: 'Storage',
                value: storage
              }
            },
            update: {},
            create: {
              productId: product.id,
              name: 'Storage',
              value: storage,
              stockValue: Math.floor(Math.random() * 10) + 2,
              price: Number(product.price) + priceIncrease,
              isActive: true
            }
          })

          await prisma.variationAttribute.upsert({
            where: {
              variationId_attributeId_value: {
                variationId: variation.id,
                attributeId: storageAttribute.id,
                value: storage
              }
            },
            update: {},
            create: {
              variationId: variation.id,
              attributeId: storageAttribute.id,
              value: storage
            }
          })
        }

        // Add RAM variations
        const ramAttribute = await prisma.productAttribute.upsert({
          where: { name: 'RAM' },
          update: {},
          create: {
            name: 'RAM',
            attributeType: 'SELECT'
          }
        })

        for (const ram of getRandomElements(variationSet.ram, 2)) {
          const ramGB = parseInt(ram)
          const priceIncrease = (ramGB / 4) * 30
          const variation = await prisma.productVariation.upsert({
            where: {
              productId_name_value: {
                productId: product.id,
                name: 'RAM',
                value: ram
              }
            },
            update: {},
            create: {
              productId: product.id,
              name: 'RAM',
              value: ram,
              stockValue: Math.floor(Math.random() * 8) + 2,
              price: Number(product.price) + priceIncrease,
              isActive: true
            }
          })

          await prisma.variationAttribute.upsert({
            where: {
              variationId_attributeId_value: {
                variationId: variation.id,
                attributeId: ramAttribute.id,
                value: ram
              }
            },
            update: {},
            create: {
              variationId: variation.id,
              attributeId: ramAttribute.id,
              value: ram
            }
          })
        }
      } else if (variationType === 'clothing') {
        // Add style variations
        for (const style of getRandomElements(variationSet.style, 2)) {
          await prisma.productVariation.create({
            data: {
              productId: product.id,
              name: 'Style',
              value: style,
              stockValue: Math.floor(Math.random() * 12) + 3,
              // Style doesn't affect price
            },
          })
        }
      } else if (variationType === 'furniture') {
        // Add material variations
        for (const material of getRandomElements(variationSet.material, 2)) {
          const priceAdjustment = material === 'Wood' ? 50 : material === 'Glass' ? 30 : 0
          await prisma.productVariation.create({
            data: {
              productId: product.id,
              name: 'Material',
              value: material,
              stockValue: Math.floor(Math.random() * 5) + 2,
              price: Number(product.price) + priceAdjustment,
            },
          })
        }
      } else {
        // Add package variations for default type
        for (const pkg of getRandomElements(variations.default.package, 2)) {
          const priceAdjustment = pkg === 'Premium' ? 30 : pkg === 'Deluxe' ? 50 : 0
          await prisma.productVariation.create({
            data: {
              productId: product.id,
              name: 'Package',
              value: pkg,
              stockValue: Math.floor(Math.random() * 10) + 2,
              price: pkg === 'Standard' ? null : Number(product.price) + priceAdjustment,
            },
          })
        }
      }

      console.log('Successfully added variations')
    } catch (error) {
      console.error(`Error adding variations to product ${product.name}:`, error)
    }
  }

  console.log('\nFinished adding product variations')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 