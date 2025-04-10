import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Sample product images by category
const productImages = {
  electronics: [
    '/products/electronics/headphones.jpg',
    '/products/electronics/smartphone.jpg',
    '/products/electronics/laptop.jpg',
    '/products/electronics/tablet.jpg',
    '/products/electronics/smartwatch.jpg',
    '/products/electronics/camera.jpg',
    '/products/electronics/gaming-console.jpg',
    '/products/electronics/earbuds.jpg',
    '/products/electronics/tablet.jpg',
    '/products/electronics/smart-home.jpg'
  ],
  fashion: [
    '/products/fashion/tshirt.jpg',
    '/products/fashion/jeans.jpg',
    '/products/fashion/dress.jpg',
    '/products/fashion/shoes.jpg',
    '/products/fashion/jacket.jpg',
    '/products/fashion/skirt.jpg',
    '/products/fashion/sweater.jpg',
    '/products/fashion/hat.jpg',
    '/products/fashion/bag.jpg',
    '/products/fashion/accessories.jpg'
  ],
  'home-living': [
    '/products/home-living/sofa.jpg',
    '/products/home-living/chair.jpg',
    '/products/home-living/table.jpg',
    '/products/home-living/lamp.jpg',
    '/products/home-living/rug.jpg',
    '/products/home-living/curtains.jpg',
    '/products/home-living/pillow.jpg',
    '/products/home-living/blanket.jpg',
    '/products/home-living/mirror.jpg',
    '/products/home-living/artwork.jpg'
  ],
  'sports-outdoors': [
    '/products/sports-outdoors/bike.jpg',
    '/products/sports-outdoors/tent.jpg',
    '/products/sports-outdoors/sleeping-bag.jpg',
    '/products/sports-outdoors/hiking-boots.jpg',
    '/products/sports-outdoors/backpack.jpg',
    '/products/sports-outdoors/water-bottle.jpg',
    '/products/sports-outdoors/helmet.jpg',
    '/products/sports-outdoors/gloves.jpg',
    '/products/sports-outdoors/compass.jpg',
    '/products/sports-outdoors/first-aid-kit.jpg'
  ]
};

// Product variations
const productVariations = {
  electronics: [
    { color: 'Black', storage: '128GB' },
    { color: 'Silver', storage: '256GB' },
    { color: 'Gold', storage: '512GB' }
  ],
  fashion: [
    { size: 'S', color: 'Black' },
    { size: 'M', color: 'Navy' },
    { size: 'L', color: 'White' }
  ],
  'home-living': [
    { size: 'Small', color: 'Beige' },
    { size: 'Medium', color: 'Gray' },
    { size: 'Large', color: 'Brown' }
  ],
  'sports-outdoors': [
    { size: 'Small', color: 'Red' },
    { size: 'Medium', color: 'Blue' },
    { size: 'Large', color: 'Green' }
  ]
};

async function main() {
  try {
    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        childCategories: true
      }
    });

    console.log(`Found ${categories.length} categories`);
    console.log('First category:', categories[0]);

    // Generate products for each category
    for (const category of categories) {
      console.log(`Generating products for category: ${category.name}`);
      console.log('Category details:', {
        id: category.id,
        name: category.name,
        parentCategoryId: category.parentCategoryId,
        imageUrl: category.imageUrl,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
        slug: category.slug,
        childCategories: category.childCategories
      });

      // Generate 20 products for main category
      for (let i = 0; i < 20; i++) {
        const categoryType = category.name.toLowerCase().includes('electronics') ? 'electronics' :
                           category.name.toLowerCase().includes('fashion') ? 'fashion' :
                           category.name.toLowerCase().includes('home') ? 'home-living' :
                           category.name.toLowerCase().includes('sports') ? 'sports-outdoors' : 'electronics';

        const productName = faker.commerce.productName();
        const basePrice = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
        
        // Create base product
        const product = await prisma.product.create({
          data: {
            name: productName,
            description: faker.lorem.paragraph(),
            price: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
            sku: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
            category: {
              connect: {
                id: category.id
              }
            },
            images: {
              create: {
                imageUrl: `/products/${category.slug}/${faker.helpers.arrayElement(['headphones.jpg', 'laptop.jpg', 'phone.jpg'])}`,
                isMain: true
              }
            },
            inventory: {
              create: {
                quantity: faker.number.int({ min: 0, max: 100 })
              }
            },
            specifications: {
              create: [
                {
                  name: "color",
                  value: categoryType === 'electronics' ? productVariations[categoryType][i % productVariations[categoryType].length].color :
                         categoryType === 'fashion' ? productVariations[categoryType][i % productVariations[categoryType].length].color :
                         categoryType === 'home-living' ? productVariations[categoryType][i % productVariations[categoryType].length].color :
                         productVariations[categoryType][i % productVariations[categoryType].length].color
                },
                {
                  name: "storage",
                  value: categoryType === 'electronics' ? productVariations[categoryType][i % productVariations[categoryType].length].storage :
                         categoryType === 'fashion' ? productVariations[categoryType][i % productVariations[categoryType].length].size :
                         categoryType === 'home-living' ? productVariations[categoryType][i % productVariations[categoryType].length].size :
                         productVariations[categoryType][i % productVariations[categoryType].length].size
                }
              ]
            }
          }
        });

        // Create 3 variations for each product
        for (const variation of productVariations[categoryType]) {
          const variationPrice = basePrice + faker.number.int({ min: -50, max: 50 });
          const variationName = `${productName} - ${Object.values(variation).join(' ')}`;
          
          await prisma.product.create({
            data: {
              name: variationName,
              description: faker.commerce.productDescription(),
              price: variationPrice,
              sku: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
              category: {
                connect: {
                  id: category.id
                }
              },
              images: {
                create: {
                  imageUrl: productImages[categoryType][i % productImages[categoryType].length],
                  isMain: true
                }
              },
              inventory: {
                create: {
                  quantity: faker.number.int({ min: 0, max: 100 })
                }
              },
              specifications: {
                create: [
                  {
                    name: "color",
                    value: variation.color
                  },
                  {
                    name: "size",
                    value: variation.size
                  }
                ]
              }
            }
          });
        }
      }

      // Generate products for child categories
      if (category.childCategories && category.childCategories.length > 0) {
        for (const childCategory of category.childCategories) {
          console.log(`Generating products for child category: ${childCategory.name}`);
          
          for (let i = 0; i < 20; i++) {
            const categoryType = childCategory.name.toLowerCase().includes('electronics') ? 'electronics' :
                               childCategory.name.toLowerCase().includes('fashion') ? 'fashion' :
                               childCategory.name.toLowerCase().includes('home') ? 'home-living' :
                               childCategory.name.toLowerCase().includes('sports') ? 'sports-outdoors' : 'electronics';

            const productName = faker.commerce.productName();
            const basePrice = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
            
            // Create base product
            const product = await prisma.product.create({
              data: {
                name: productName,
                description: faker.lorem.paragraph(),
                price: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
                sku: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
                category: {
                  connect: {
                    id: childCategory.id
                  }
                },
                images: {
                  create: {
                    imageUrl: `/products/${childCategory.slug}/${faker.helpers.arrayElement(['headphones.jpg', 'laptop.jpg', 'phone.jpg'])}`,
                    isMain: true
                  }
                },
                inventory: {
                  create: {
                    quantity: faker.number.int({ min: 0, max: 100 })
                  }
                },
                specifications: {
                  create: [
                    {
                      name: "color",
                      value: categoryType === 'electronics' ? productVariations[categoryType][i % productVariations[categoryType].length].color :
                             categoryType === 'fashion' ? productVariations[categoryType][i % productVariations[categoryType].length].color :
                             categoryType === 'home-living' ? productVariations[categoryType][i % productVariations[categoryType].length].color :
                             productVariations[categoryType][i % productVariations[categoryType].length].color
                    },
                    {
                      name: "size",
                      value: categoryType === 'electronics' ? productVariations[categoryType][i % productVariations[categoryType].length].storage :
                             categoryType === 'fashion' ? productVariations[categoryType][i % productVariations[categoryType].length].size :
                             categoryType === 'home-living' ? productVariations[categoryType][i % productVariations[categoryType].length].size :
                             productVariations[categoryType][i % productVariations[categoryType].length].size
                    }
                  ]
                }
              }
            });

            // Create 3 variations for each product
            for (const variation of productVariations[categoryType]) {
              const variationPrice = basePrice + faker.number.int({ min: -50, max: 50 });
              const variationName = `${productName} - ${Object.values(variation).join(' ')}`;
              
              await prisma.product.create({
                data: {
                  name: variationName,
                  description: faker.commerce.productDescription(),
                  price: variationPrice,
                  sku: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
                  category: {
                    connect: {
                      id: childCategory.id
                    }
                  },
                  images: {
                    create: {
                      imageUrl: productImages[categoryType][i % productImages[categoryType].length],
                      isMain: true
                    }
                  },
                  inventory: {
                    create: {
                      quantity: faker.number.int({ min: 0, max: 100 })
                    }
                  },
                  specifications: {
                    create: [
                      {
                        name: "color",
                        value: variation.color
                      },
                      {
                        name: "size",
                        value: variation.size
                      }
                    ]
                  }
                }
              });
            }
          }
        }
      }
    }

    console.log('Product seeding completed successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 