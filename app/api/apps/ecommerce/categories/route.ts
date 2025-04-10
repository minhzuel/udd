import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/api';
import { getDemoUser, isUnique } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import * as z from 'zod';
import { verifyJwtToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional()
});

// GET: Fetch all categories with permissions and creator details
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'createdAt';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const skip = (page - 1) * limit;

  try {
    // Count total records matching the filter
    const total = await prisma.ecommerceCategory.count({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });

    let isTableEmpty = false;

    if (total === 0) {
      // Check if the entire table is empty
      const overallTotal = await prisma.ecommerceCategory.count();
      isTableEmpty = overallTotal === 0;
    }

    // Get paginated categories with creator details
    const categories =
      total > 0
        ? await prisma.ecommerceCategory.findMany({
            skip,
            take: limit,
            where: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            orderBy: {
              [sortField]: sortDirection,
            },
            include: {
              parent: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              createdByUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              _count: {
                select: { ecommerceProduct: true },
              },
            },
          })
        : [];

    const responseData = categories.map((category) => ({
      ...category,
      productCount: category._count.ecommerceProduct, // Add product count
    }));

    return NextResponse.json({
      data: responseData,
      pagination: {
        total,
        page,
      },
      empty: isTableEmpty,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}

// POST: Add a new category
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const payload = await verifyJwtToken(token);
    if (!payload?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 },
      );
    }

    const { name, slug, description, parentId } = result.data;

    const existingCategory = await prisma.ecommerceCategory.findFirst({
      where: {
        OR: [
          { name },
          { slug },
        ],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Category with this name or slug already exists' },
        { status: 400 },
      );
    }

    if (parentId) {
      const parentCategory = await prisma.ecommerceCategory.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { message: 'Parent category not found' },
          { status: 400 },
        );
      }
    }

    // Create the new category
    const newCategory = await prisma.ecommerceCategory.create({
      data: {
        name,
        slug,
        description,
        parentId,
        createdByUserId: user.id,
      },
    });

    // Log
    await systemLog({
      event: 'create',
      userId: user.id,
      entityId: newCategory.id,
      entityType: 'category',
      description: 'Category created by user',
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Failed to create category' },
      { status: 500 },
    );
  }
}
