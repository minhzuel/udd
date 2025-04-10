import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create default user roles
  const adminRole = await prisma.userRole.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      slug: 'admin',
      name: 'Administrator',
      description: 'System administrator with full access',
      isDefault: true,
      isProtected: true,
    },
  });

  const customerRole = await prisma.userRole.upsert({
    where: { slug: 'customer' },
    update: {},
    create: {
      slug: 'customer',
      name: 'Customer',
      description: 'Regular customer account',
      isDefault: true,
      isProtected: false,
    },
  });

  // Create default user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.m', // password: admin123
      role_id: adminRole.id,
      status: 'ACTIVE',
    },
  });

  // Create sample category
  const electronicsCategory = await prisma.ecommerceCategory.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      status: 'ACTIVE',
      createdByUserId: adminUser.id,
    },
  });

  // Create sample product
  const sampleProduct = await prisma.ecommerceProduct.upsert({
    where: { slug: 'sample-smartphone' },
    update: {},
    create: {
      name: 'Sample Smartphone',
      slug: 'sample-smartphone',
      sku: 'SMART-001',
      description: 'A high-quality smartphone with advanced features',
      price: 999.99,
      beforeDiscount: 1299.99,
      stockValue: 100,
      status: 'PUBLISHED',
      categoryId: electronicsCategory.id,
    },
  });

  // Create product variation
  // First, delete existing variations for this product
  await prisma.productVariation.deleteMany({
    where: {
      productId: sampleProduct.id,
      name: 'Color',
      value: 'Black',
    },
  });

  // Then create new variation
  await prisma.productVariation.create({
    data: {
      name: 'Color',
      value: 'Black',
      price: 999.99,
      stockValue: 50,
      sku: 'SMART-001-BLK',
      productId: sampleProduct.id,
    },
  });

  // Create system settings
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Uddog Store',
      active: true,
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      currencyFormat: '$',
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 