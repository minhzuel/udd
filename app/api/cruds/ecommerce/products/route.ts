import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { EcommerceProductStatus } from '@/app/models/ecommerce';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'name';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const status = searchParams.get('status') || null;
  const categoryId = searchParams.get('categoryId') || null;

  try {
    // Map status query to enum type, fallback to null if invalid
    const statusFilter =
      status && status !== 'all'
        ? (status as EcommerceProductStatus)
        : undefined;

    // Count total categories with filters
    const totalCount = await prisma.ecommerceProduct.count({
      where: {
        AND: [
          ...(statusFilter ? [{ status: statusFilter }] : []), // Add status filter if valid
          ...(categoryId && categoryId !== 'all' ? [{ categoryId }] : []), // Add role filter if valid
          {
            OR: [{ name: { contains: query, mode: 'insensitive' } }],
          },
        ],
      },
    });

    // Map sortField
    const sortMap: Record<
      string,
      Prisma.EcommerceProductOrderByWithRelationInput
    > = {
      name: { status: sortDirection as Prisma.SortOrder },
      status: { status: sortDirection as Prisma.SortOrder },
      createdAt: { createdAt: sortDirection as Prisma.SortOrder },
    };

    // Default to createdAt sorting if no valid field is found
    const orderBy = sortMap[sortField] || {
      createdAt: sortDirection as Prisma.SortOrder,
    };

    // Fetch categories with filters
    const categories = await prisma.ecommerceProduct.findMany({
      where: {
        AND: [
          ...(statusFilter ? [{ status: statusFilter }] : []), // Add status filter if valid
          ...(categoryId && categoryId !== 'all' ? [{ categoryId }] : []), // Add role filter if valid
          {
            OR: [{ name: { contains: query, mode: 'insensitive' } }],
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        thumbnail: true,
        sku: true,
        status: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: categories,
      pagination: {
        total: totalCount,
        page,
        limit,
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
