import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getClientIP } from '@/lib/api';
import { getDemoUser } from '@/lib/db';
import { prisma } from '@/lib/prisma'; // Adjust the import based on your Prisma setup
import { systemLog } from '@/services/system-log';

export async function DELETE(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const currentUser = await getDemoUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized action.' },
        { status: 401 },
      );
    }

    const clientIp = getClientIP(request);
    const body = await request.json();
    const { permissionIds } = body;

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      return NextResponse.json({ message: 'Invalid input.' }, { status: 400 });
    }

    // Validation: Limit deletion to a maximum of 2 records to ensure a smooth demo experience for users.
    if (permissionIds.length > 2) {
      return NextResponse.json(
        {
          message: 'You cannot delete more than 2 records at once.',
        },
        { status: 400 },
      );
    }

    // Perform deletion in a transaction to ensure atomicity
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete linked role permissions
      await tx.userRolePermission.deleteMany({
        where: {
          permissionId: { in: permissionIds },
        },
      });

      // Delete the permissions themselves
      await tx.userPermission.deleteMany({
        where: {
          id: { in: permissionIds },
        },
      });

      // Log the event
      await systemLog(
        {
          event: 'create',
          userId: currentUser.id,
          entityId: permissionIds.join(', '),
          entityType: 'user.permissions',
          description: 'User permissions deleted.',
          ipAddress: clientIp,
        },
        tx,
      );
    });

    return NextResponse.json({
      message: 'Delete selected success',
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
