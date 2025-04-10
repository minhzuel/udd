import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Checking for duplicate users by email...');
  
  // Find duplicate emails
  const duplicateEmails = await prisma.$queryRaw`
    SELECT email, COUNT(*) as count
    FROM users
    WHERE email IS NOT NULL AND email <> ''
    GROUP BY email
    HAVING COUNT(*) > 1
  `;
  
  console.log('Duplicate emails:');
  console.table(duplicateEmails);
  
  // Find duplicate mobile numbers
  console.log('Checking for duplicate users by mobile number...');
  
  const duplicateMobiles = await prisma.$queryRaw`
    SELECT mobile_no, COUNT(*) as count
    FROM users
    WHERE mobile_no IS NOT NULL AND mobile_no <> ''
    GROUP BY mobile_no
    HAVING COUNT(*) > 1
  `;
  
  console.log('Duplicate mobile numbers:');
  console.table(duplicateMobiles);
  
  // Find users with duplicate emails
  if (Array.isArray(duplicateEmails) && duplicateEmails.length > 0) {
    for (const dup of duplicateEmails) {
      const email = dup.email;
      const users = await prisma.user.findMany({
        where: { email },
        orderBy: { id: 'asc' }
      });
      
      console.log(`\nUsers with email ${email}:`);
      console.table(users.map(u => ({
        id: u.id,
        fullName: u.fullName,
        mobileNo: u.mobileNo,
        email: u.email,
        userType: u.userType,
        isVerified: u.isVerified
      })));
    }
  }
  
  // Find users with duplicate mobile numbers
  if (Array.isArray(duplicateMobiles) && duplicateMobiles.length > 0) {
    for (const dup of duplicateMobiles) {
      const mobileNo = dup.mobile_no;
      const users = await prisma.user.findMany({
        where: { mobileNo },
        orderBy: { id: 'asc' }
      });
      
      console.log(`\nUsers with mobile number ${mobileNo}:`);
      console.table(users.map(u => ({
        id: u.id,
        fullName: u.fullName,
        mobileNo: u.mobileNo,
        email: u.email,
        userType: u.userType,
        isVerified: u.isVerified
      })));
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 