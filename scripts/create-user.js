import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create or get the customer role
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

  // Hash the password
  const hashedPassword = await hash('customer', 12);

  // Create the user
  const user = await prisma.user.upsert({
    where: { email: 'needjuel@gmail.com' },
    update: {},
    create: {
      name: 'Need Juel',
      email: 'needjuel@gmail.com',
      password: hashedPassword,
      role_id: customerRole.id,
      status: 'ACTIVE',
    },
  });

  console.log('User created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 