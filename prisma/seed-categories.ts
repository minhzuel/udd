import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics', metaDescription: 'Electronic devices and accessories' },
  { name: 'Fashion', metaDescription: 'Clothing, shoes, and accessories' },
  { name: 'Home & Living', metaDescription: 'Home decor and living essentials' },
  { name: 'Beauty & Personal Care', metaDescription: 'Beauty products and personal care items' },
  { name: 'Sports & Outdoors', metaDescription: 'Sports equipment and outdoor gear' },
  { name: 'Books & Stationery', metaDescription: 'Books, notebooks, and writing supplies' },
  { name: 'Toys & Games', metaDescription: 'Toys, board games, and entertainment' },
  { name: 'Automotive', metaDescription: 'Car parts, accessories, and tools' },
  { name: 'Health & Wellness', metaDescription: 'Health products and wellness items' },
  { name: 'Food & Groceries', metaDescription: 'Food items and grocery products' },
  { name: 'Kitchen & Dining', metaDescription: 'Kitchen appliances and dining essentials' },
  { name: 'Pet Supplies', metaDescription: 'Products for pets and animals' },
  { name: 'Garden & Outdoor', metaDescription: 'Gardening tools and outdoor equipment' },
  { name: 'Office Supplies', metaDescription: 'Office equipment and stationery' },
  { name: 'Baby & Kids', metaDescription: 'Products for babies and children' },
  { name: 'Jewelry & Accessories', metaDescription: 'Jewelry and fashion accessories' },
  { name: "Men's Clothing", metaDescription: "Men's apparel and accessories" },
  { name: "Women's Clothing", metaDescription: "Women's apparel and accessories" },
  { name: 'Smart Home', metaDescription: 'Smart home devices and automation' },
  { name: 'Fitness Equipment', metaDescription: 'Exercise and fitness gear' },
  { name: 'Laptops & Computers', metaDescription: 'Computers, laptops, and accessories' },
  { name: 'Smartphones & Tablets', metaDescription: 'Mobile devices and accessories' },
  { name: 'Home Decor', metaDescription: 'Home decoration and interior design' },
  { name: 'Furniture', metaDescription: 'Home and office furniture' },
  { name: 'Camping & Hiking', metaDescription: 'Camping and hiking equipment' },
  { name: 'Cycling', metaDescription: 'Bicycles and cycling accessories' },
  { name: 'Home Kitchen', metaDescription: 'Kitchen appliances and cookware' },
  { name: 'Clothing & Apparel', metaDescription: 'General clothing and fashion items' },
  { name: 'Sports Equipment', metaDescription: 'Sports gear and equipment' },
  { name: 'Home Furniture', metaDescription: 'Home furniture and furnishings' }
];

async function seedCategories() {
  console.log('Seeding categories...');
  
  for (const category of categories) {
    const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    await prisma.category.create({
      data: {
        name: category.name,
        slug: slug,
        metaDescription: category.metaDescription,
        imageUrl: '/categories/category.png',
        metaTitle: category.name
      },
    });
  }

  console.log('Categories seeded successfully!');
}

seedCategories()
  .catch((error) => {
    console.error('Error seeding categories:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 