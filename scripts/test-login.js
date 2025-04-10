import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting test login process...');
    
    // Test user data
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      mobileNo: '1234567890',
      userType: 'customer',
      isVerified: true
    };
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { email: testUser.email }
    });
    
    let user;
    
    if (existingUser) {
      console.log('Test user already exists, updating password...');
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
    } else {
      console.log('Creating test user...');
      user = await prisma.user.create({
        data: {
          fullName: testUser.fullName,
          email: testUser.email,
          password: hashedPassword,
          mobileNo: testUser.mobileNo,
          userType: testUser.userType,
          isVerified: testUser.isVerified
        }
      });
      
      console.log('Creating customer record...');
      await prisma.customer.create({
        data: {
          userId: user.id,
          customerType: 'individual'
        }
      });
    }
    
    console.log(`Test user created/updated with ID: ${user.id}`);
    console.log('Login credentials:');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error in test login process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 