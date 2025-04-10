import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import * as z from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  beforeDiscount: z.number().min(0).optional(),
  thumbnail: z.string().optional(),
  stockValue: z.number().min(0),
  categoryId: z.string(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  images: z.array(z.string()).optional(),
  variations: z.array(z.object({
    name: z.string(),
    value: z.string(),
    price: z.number().min(0).optional(),
    stockValue: z.number().min(0),
    sku: z.string().optional()
  })).optional()
});

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
    const statusFilter = status && status !== 'all'
      ? (status as ProductStatus)
      : undefined;

    const totalCount = await prisma.ecommerceProduct.count({
      where: {
        AND: [
          ...(statusFilter ? [{ status: statusFilter }] : []),
          ...(categoryId && categoryId !== 'all' ? [{ categoryId }] : []),
          {
            OR: [{ name: { contains: query, mode: 'insensitive' } }]
          }
        ]
      }
    });

    const sortMap: Record<string, Prisma.EcommerceProductOrderByWithRelationInput> = {
      name: { name: sortDirection as Prisma.SortOrder },
      status: { status: sortDirection as Prisma.SortOrder },
      createdAt: { createdAt: sortDirection as Prisma.SortOrder }
    };

    const orderBy = sortMap[sortField] || {
      createdAt: sortDirection as Prisma.SortOrder
    };

    const products = await prisma.ecommerceProduct.findMany({
      where: {
        AND: [
          ...(statusFilter ? [{ status: statusFilter }] : []),
          ...(categoryId && categoryId !== 'all' ? [{ categoryId }] : []),
          {
            OR: [{ name: { contains: query, mode: 'insensitive' } }]
          }
        ]
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        thumbnail: true,
        price: true,
        beforeDiscount: true,
        stockValue: true,
        status: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            productImage: true,
            variations: true
          }
        }
      }
    });

    return NextResponse.json({
      data: products,
      pagination: {
        total: totalCount,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyJwtToken(token);
    if (!payload?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      );
    }

    const productData = result.data;

    const existingProduct = await prisma.ecommerceProduct.findFirst({
      where: {
        OR: [
          { name: productData.name },
          { slug: productData.slug }
        ]
      }
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: 'Product with this name or slug already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.ecommerceCategory.findUnique({
      where: { id: productData.categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.ecommerceProduct.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        sku: productData.sku,
        description: productData.description,
        price: productData.price,
        beforeDiscount: productData.beforeDiscount,
        thumbnail: productData.thumbnail,
        stockValue: productData.stockValue,
        categoryId: productData.categoryId,
        status: productData.status,
        productImage: {
          create: productData.images?.map(url => ({ url })) || []
        },
        variations: {
          create: productData.variations?.map(variation => ({
            name: variation.name,
            value: variation.value,
            price: variation.price,
            stockValue: variation.stockValue,
            sku: variation.sku
          })) || []
        }
      }
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
