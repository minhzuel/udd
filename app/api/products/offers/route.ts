import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.products.findMany({
      where: {
        offer_price: {
          not: null
        },
        offer_expiry: {
          gt: new Date()
        }
      },
      include: {
        categories: {
          select: {
            category_name: true,
            slug: true
          }
        },
        inventory: true,
        product_specifications: true,
        product_images: {
          select: {
            image_url: true,
            is_main: true
          },
          orderBy: {
            is_main: 'desc'
          }
        }
      },
      take: 10
    });

    // Format the response
    const formattedProducts = products.map(product => ({
      id: product.product_id,
      name: product.name,
      price: Number(product.price),
      offerPrice: Number(product.offer_price),
      discountPercentage: Math.round(((Number(product.price) - Number(product.offer_price)) / Number(product.price)) * 100),
      offerExpiry: product.offer_expiry,
      mainImage: product.main_image || '/images/placeholder.png',
      stockQuantity: product.inventory?.[0]?.quantity || 0,
      specifications: product.product_specifications.map(spec => ({
        name: spec.name,
        value: spec.value
      })),
      category: product.categories ? {
        name: product.categories.category_name,
        slug: product.categories.slug
      } : null
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
} 