const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// List of tech brands to add
const brandsList = [
  { name: 'Asus', imageUrl: '/categories/category.png' },
  { name: 'Acer', imageUrl: '/categories/category.png' },
  { name: 'MSI', imageUrl: '/categories/category.png' },
  { name: 'Gigabyte', imageUrl: '/categories/category.png' },
  { name: 'Razer', imageUrl: '/categories/category.png' },
  { name: 'Logitech', imageUrl: '/categories/category.png' },
  { name: 'Corsair', imageUrl: '/categories/category.png' },
  { name: 'SteelSeries', imageUrl: '/categories/category.png' },
  { name: 'HyperX', imageUrl: '/categories/category.png' },
  { name: 'Alienware', imageUrl: '/categories/category.png' },
  { name: 'BenQ', imageUrl: '/categories/category.png' },
  { name: 'Canon', imageUrl: '/categories/category.png' },
  { name: 'Nikon', imageUrl: '/categories/category.png' },
  { name: 'Sony', imageUrl: '/categories/category.png' },
  { name: 'DJI', imageUrl: '/categories/category.png' },
  { name: 'GoPro', imageUrl: '/categories/category.png' },
  { name: 'Epson', imageUrl: '/categories/category.png' },
  { name: 'HP', imageUrl: '/categories/category.png' },
  { name: 'Brother', imageUrl: '/categories/category.png' },
  { name: 'Netgear', imageUrl: '/categories/category.png' },
  { name: 'TP-Link', imageUrl: '/categories/category.png' },
  { name: 'Cisco', imageUrl: '/categories/category.png' },
  { name: 'D-Link', imageUrl: '/categories/category.png' },
  { name: 'Fitbit', imageUrl: '/categories/category.png' },
  { name: 'Garmin', imageUrl: '/categories/category.png' },
  { name: 'Apple', imageUrl: '/categories/category.png' },
  { name: 'Samsung', imageUrl: '/categories/category.png' },
  { name: 'Anker', imageUrl: '/categories/category.png' },
  { name: 'Belkin', imageUrl: '/categories/category.png' },
  { name: 'JBL', imageUrl: '/categories/category.png' }
];

async function addBrandsToProducts() {
  console.log('Starting to add brands and update products...');

  // First, create the brands
  console.log('Creating brands...');
  const createdBrands = [];
  
  for (const brand of brandsList) {
    const createdBrand = await prisma.brand.create({
      data: {
        name: brand.name,
        imageUrl: brand.imageUrl
      }
    });
    createdBrands.push(createdBrand);
    console.log(`Created brand: ${brand.name}`);
  }
  
  console.log(`✅ Created ${createdBrands.length} brands`);

  // Get all products
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to update`);

  // Update each product with a random brand
  let updatedCount = 0;
  
  for (const product of products) {
    // Select a random brand
    const randomBrand = createdBrands[Math.floor(Math.random() * createdBrands.length)];
    
    // Update the product
    await prisma.product.update({
      where: { id: product.id },
      data: {
        brandId: randomBrand.id
      }
    });
    
    updatedCount++;
    
    if (updatedCount % 50 === 0) {
      console.log(`Updated ${updatedCount}/${products.length} products`);
    }
  }
  
  console.log(`✅ Updated all ${updatedCount} products with random brands`);
  console.log('Process completed successfully!');
}

addBrandsToProducts()
  .catch((e) => {
    console.error('Error updating products with brands:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 