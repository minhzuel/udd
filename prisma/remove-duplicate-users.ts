import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First identify all duplicate users by email
      console.log('Finding duplicate users by email...');
      const duplicateEmails = await tx.$queryRaw`
        SELECT email 
        FROM users 
        WHERE email IS NOT NULL AND email <> '' 
        GROUP BY email 
        HAVING COUNT(*) > 1
      `;

      // For each duplicate email, keep the lowest ID and remove others
      for (const row of duplicateEmails as any[]) {
        const email = row.email;
        
        // Get all users with this email
        const users = await tx.user.findMany({
          where: { email },
          orderBy: { id: 'asc' }
        });
        
        if (users.length <= 1) continue;
        
        // Keep the first (lowest ID) user and delete the rest
        const keepUser = users[0];
        const deleteUsers = users.slice(1);
        
        console.log(`For email ${email}: Keeping user ID ${keepUser.id}, deleting IDs: ${deleteUsers.map(u => u.id).join(', ')}`);
        
        // Delete duplicate users
        for (const user of deleteUsers) {
          // First check and handle any related records that might cause foreign key constraints
          
          // Update or delete related order records
          await tx.order.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related address records
          await tx.address.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related customer records
          await tx.customer.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related productQuestion records
          await tx.productQuestion.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related productReview records
          await tx.productReview.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related returnRequest records
          await tx.returnRequest.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related rewardPoint records
          await tx.rewardPoint.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related wallet records
          await tx.wallet.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Delete user role associations
          await tx.userRole.deleteMany({
            where: { userId: user.id }
          });
          
          // Delete user address associations
          await tx.userAddress.deleteMany({
            where: { userId: user.id }
          });
          
          // Finally delete the duplicate user
          await tx.user.delete({
            where: { id: user.id }
          });
        }
      }
      
      // Now handle duplicate users by mobile number
      console.log('Finding duplicate users by mobile number...');
      const duplicateMobiles = await tx.$queryRaw`
        SELECT mobile_no 
        FROM users 
        WHERE mobile_no IS NOT NULL AND mobile_no <> '' 
        GROUP BY mobile_no 
        HAVING COUNT(*) > 1
      `;
      
      // For each duplicate mobile, keep the lowest ID and remove others
      for (const row of duplicateMobiles as any[]) {
        const mobileNo = row.mobile_no;
        
        // Get all users with this mobile number
        const users = await tx.user.findMany({
          where: { mobileNo },
          orderBy: { id: 'asc' }
        });
        
        if (users.length <= 1) continue;
        
        // Keep the first (lowest ID) user and delete the rest
        const keepUser = users[0];
        const deleteUsers = users.slice(1);
        
        console.log(`For mobile ${mobileNo}: Keeping user ID ${keepUser.id}, deleting IDs: ${deleteUsers.map(u => u.id).join(', ')}`);
        
        // Delete duplicate users using the same process as above
        for (const user of deleteUsers) {
          // Check if this user was already deleted in the email duplicate check
          const stillExists = await tx.user.findUnique({
            where: { id: user.id }
          });
          
          if (!stillExists) {
            console.log(`  User ID ${user.id} was already deleted`);
            continue;
          }
          
          // Update or delete related order records
          await tx.order.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related address records
          await tx.address.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related customer records
          await tx.customer.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related productQuestion records
          await tx.productQuestion.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related productReview records
          await tx.productReview.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related returnRequest records
          await tx.returnRequest.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related rewardPoint records
          await tx.rewardPoint.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Update or delete related wallet records
          await tx.wallet.updateMany({
            where: { userId: user.id },
            data: { userId: keepUser.id }
          });
          
          // Delete user role associations
          await tx.userRole.deleteMany({
            where: { userId: user.id }
          });
          
          // Delete user address associations
          await tx.userAddress.deleteMany({
            where: { userId: user.id }
          });
          
          // Finally delete the duplicate user
          await tx.user.delete({
            where: { id: user.id }
          });
        }
      }
      
      return { success: true };
    });
    
    console.log('Successfully removed duplicate users');
  } catch (error) {
    console.error('Error removing duplicate users:', error);
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