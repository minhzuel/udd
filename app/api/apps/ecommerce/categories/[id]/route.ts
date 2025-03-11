import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/api';
import { getDemoUser, isUnique } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import {
  CategorySchema,
  CategorySchemaType,
} from '@/app/apps/ecommerce/categories/forms/category';

// GET: Fetch a specific category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const category = await prisma.ecommerceCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// PUT: Edit a specific category by ID
export async function PUT(
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

    const { id } = await params;
    const clientIp = getClientIP(request);

    // Ensure the ID is provided
    if (!id) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    // Check if record exists
    const existingCategory = await prisma.ecommerceCategory.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsedData = CategorySchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const { name, description }: CategorySchemaType = parsedData.data;

    // Check uniqueness for name only (slug is not updatable)
    const isUniqueCategory = await isUnique(
      'ecommerceCategory',
      { name },
      { id },
    );
    if (!isUniqueCategory) {
      return NextResponse.json(
        { message: 'Category name and slug must be unique.' },
        { status: 400 },
      );
    }

    // Update the category (excluding slug)
    const updatedCategory = await prisma.ecommerceCategory.update({
      where: { id },
      data: { name, description },
    });

    // Log
    await systemLog({
      event: 'update',
      userId: currentUser.id,
      entityId: id,
      entityType: 'category',
      description: 'Category updated by user',
      ipAddress: clientIp,
    });

    return NextResponse.json(updatedCategory);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// DELETE: Remove a specific category by ID
export async function DELETE(
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

    const { id } = await params;
    const clientIp = getClientIP(request);

    if (!id) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    // Check if the category exists
    const existingCategory = await prisma.ecommerceCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    // Check if the category is used by any product
    const associatedProducts = await prisma.ecommerceProduct.findMany({
      where: { categoryId: id },
    });

    if (associatedProducts.length > 0) {
      return NextResponse.json(
        {
          message:
            'Unable to delete this record because it is linked to other records.',
        },
        { status: 400 },
      );
    }

    // Delete the category
    await prisma.ecommerceCategory.delete({
      where: { id },
    });

    // Log
    await systemLog({
      event: 'delete',
      userId: currentUser.id,
      entityId: id,
      entityType: 'category',
      description: 'Category deleted by user',
      ipAddress: clientIp,
    });

    return NextResponse.json({ message: 'Category deleted successfully.' });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
