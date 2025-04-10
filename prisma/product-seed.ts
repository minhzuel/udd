import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function slugify(text: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    + '-' + randomSuffix;        // Add random suffix
}

const brands = [
  { id: 1, name: 'Apple', imageUrl: '/media/brands/apple.png' },
  { id: 2, name: 'Samsung', imageUrl: '/media/brands/samsung.png' },
  { id: 3, name: 'Sony', imageUrl: '/media/brands/sony.png' },
  { id: 4, name: 'LG', imageUrl: '/media/brands/lg.png' },
  { id: 5, name: 'Dell', imageUrl: '/media/brands/dell.png' },
  { id: 6, name: 'HP', imageUrl: '/media/brands/hp.png' },
  { id: 7, name: 'Lenovo', imageUrl: '/media/brands/lenovo.png' },
  { id: 8, name: 'Asus', imageUrl: '/media/brands/asus.png' },
  { id: 9, name: 'Xiaomi', imageUrl: '/media/brands/xiaomi.png' },
  { id: 10, name: 'Huawei', imageUrl: '/media/brands/huawei.png' }
];

const productImages = [
  '/media/products/product1.jpg',
  '/media/products/product2.jpg',
  '/media/products/product3.jpg',
  '/media/products/product4.jpg',
  '/media/products/product5.jpg',
  '/media/products/product6.jpg',
  '/media/products/product7.jpg',
  '/media/products/product8.jpg',
  '/media/products/product9.jpg',
  '/media/products/product10.jpg'
];

async function createBrands() {
  console.log('Creating brands...');
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: {
        name: brand.name,
        imageUrl: brand.imageUrl
      },
      create: {
        id: brand.id,
        name: brand.name,
        imageUrl: brand.imageUrl
      }
    });
  }
  console.log('Brands created successfully');
}

async function seedProducts() {
  console.log('Starting to seed products...');
  
  // Get all categories
  const categories = await prisma.category.findMany();
  const brands = await prisma.brand.findMany();
  
  for (const category of categories) {
    console.log(`Creating products for category: ${category.name}`);
    
    for (let i = 0; i < 20; i++) {
      const name = faker.commerce.productName();
      const price = parseFloat(faker.commerce.price({ min: 100, max: 5000 }));
      const offerPrice = price * 0.8; // 20% discount
      const offerExpiry = new Date();
      offerExpiry.setDate(offerExpiry.getDate() + 30); // 30 days from now
      
      const product = await prisma.product.create({
        data: {
          name,
          slug: slugify(name),
          description: faker.commerce.productDescription(),
          price,
          offerPrice,
          offerExpiry,
          weight: parseFloat(faker.number.float({ min: 0.1, max: 10 }).toFixed(2)),
          length: parseFloat(faker.number.float({ min: 10, max: 100 }).toFixed(2)),
          width: parseFloat(faker.number.float({ min: 10, max: 100 }).toFixed(2)),
          height: parseFloat(faker.number.float({ min: 10, max: 100 }).toFixed(2)),
          cost: price * 0.6, // 40% margin
          metaTitle: `${name} - Best Deals and Reviews`,
          metaDescription: faker.commerce.productDescription(),
          categoryId: category.id,
          brandId: brands[Math.floor(Math.random() * brands.length)].id,
          productType: 'physical',
          sku: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
          images: {
            create: [
              {
                imageUrl: productImages[Math.floor(Math.random() * productImages.length)],
                isMain: true
              },
              {
                imageUrl: productImages[Math.floor(Math.random() * productImages.length)],
                isMain: false
              },
              {
                imageUrl: productImages[Math.floor(Math.random() * productImages.length)],
                isMain: false
              }
            ]
          }
        }
      });
      
      console.log(`Created product: ${product.name}`);
    }
  }
  
  console.log('Finished seeding products');
}

async function main() {
  await createBrands();
  await seedProducts();
}

main()
  .catch((error) => {
    console.error('Error seeding data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 