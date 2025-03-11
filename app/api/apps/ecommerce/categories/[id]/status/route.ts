import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/api';
import { getDemoUser } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check if the user is authenticated
    const currentUser = await getDemoUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized action.' },
        { status: 401 },
      );
    }

    // Parse request body
    const { status } = await request.json();

    const clientIp = getClientIP(request);
    const { id } = await params;

    // Find the category before updating to ensure it exists
    const existingCategory = await prisma.ecommerceCategory.findUnique({
      where: { id },
    });

    // Return a 404 error if the category does not exist
    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    // Update the category status
    const updatedCategory = await prisma.ecommerceCategory.update({
      where: { id: id },
      data: { status },
    });

    // Log the update event
    await systemLog({
      event: 'update',
      userId: currentUser.id,
      entityId: id,
      entityType: 'category',
      description: 'Category status updated by user',
      ipAddress: clientIp,
    });

    // Return the updated category data
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
