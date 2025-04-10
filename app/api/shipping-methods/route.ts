import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all active shipping methods
    const shippingMethods = await prisma.shipping_methods.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        base_cost: 'asc'
      }
    })
    
    // Transform snake_case field names to camelCase for frontend compatibility
    const transformedMethods = shippingMethods.map(method => ({
      id: method.shipping_method_id,
      name: method.name,
      description: method.description,
      base_cost: method.base_cost,
      isActive: method.is_active
    }))
    
    return NextResponse.json({ shippingMethods: transformedMethods })
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    )
  }
}

// Create a new shipping method (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.base_cost) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }
    
    // Create the shipping method
    const shippingMethod = await prisma.shipping_methods.create({
      data: {
        name: body.name,
        description: body.description || '',
        base_cost: body.base_cost,
        is_active: body.isActive !== undefined ? body.isActive : true
      }
    })
    
    // Transform the response
    const transformedMethod = {
      id: shippingMethod.shipping_method_id,
      name: shippingMethod.name,
      description: shippingMethod.description,
      base_cost: shippingMethod.base_cost,
      isActive: shippingMethod.is_active
    }
    
    return NextResponse.json({ 
      shippingMethod: transformedMethod,
      message: 'Shipping method created successfully' 
    }, { 
      status: 201 
    })
  } catch (error) {
    console.error('Error creating shipping method:', error)
    return NextResponse.json(
      { error: 'Failed to create shipping method' },
      { status: 500 }
    )
  }
} 