import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    // Await params to ensure it's fully available
    const unwrappedParams = await params;
    const orderId = unwrappedParams.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Attempt to parse the order ID as a number
    const orderIdNum = parseInt(orderId);
    if (isNaN(orderIdNum)) {
      return NextResponse.json({ error: 'Invalid Order ID format' }, { status: 400 })
    }

    // Check if this is a guest order request - explicitly check for the string "true"
    const url = new URL(request.url);
    const allowGuest = url.searchParams.get('allowGuest') === 'true';
    
    console.log(`API: Fetching order ${orderIdNum}, allowGuest=${allowGuest}, URL=${request.url}`);
    
    // Only check authentication for non-guest orders
    const userId = await getSessionUserId(request);
    if (!userId && !allowGuest) {
      console.log(`Unauthorized: No user ID and allowGuest=${allowGuest}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let order;
    
    // Get the order data - use a simpler approach
    try {
      // For guest orders, we don't filter by user_id
      if (allowGuest) {
        console.log(`Getting guest order ${orderIdNum}`);
        const guestOrderQuery = `
          SELECT 
            o.order_id as id, 
            o.user_id as "userId",
            o.order_date as "orderDate", 
            o.order_status::text as "orderStatus", 
            o.total_amount as "totalAmount",
            o.shipping_address_id as "shippingAddressId",
            o.billing_address_id as "billingAddressId",
            o.subtotal as "subTotal",
            o.shipping_charge as "shippingCost",
            o.shipping_method as "shipping_method",
            o.full_name as "fullName",
            o.mobile_no as "mobileNo",
            o.email as "email"
          FROM orders o
          WHERE o.order_id = $1
        `;
        
        const orderData = await prisma.$queryRawUnsafe(guestOrderQuery, orderIdNum);
        
        if (!orderData || !Array.isArray(orderData) || orderData.length === 0) {
          console.log(`No guest order found with ID ${orderIdNum}`);
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        order = orderData[0];
        console.log(`Found guest order #${orderIdNum}:`, order);
      } else {
        console.log(`Getting user order ${orderIdNum} for user ${userId}`);
        // For authenticated users, we filter by user_id
        const userOrderQuery = `
          SELECT 
            o.order_id as id, 
            o.user_id as "userId",
            o.order_date as "orderDate", 
            o.order_status::text as "orderStatus", 
            o.total_amount as "totalAmount",
            o.shipping_address_id as "shippingAddressId",
            o.billing_address_id as "billingAddressId",
            o.subtotal as "subTotal",
            o.shipping_charge as "shippingCost",
            o.shipping_method as "shipping_method",
            o.full_name as "fullName",
            o.mobile_no as "mobileNo",
            o.email as "email"
          FROM orders o
          WHERE o.order_id = $1 AND o.user_id = $2
        `;
        
        const orderData = await prisma.$queryRawUnsafe(userOrderQuery, orderIdNum, userId);
        
        if (!orderData || !Array.isArray(orderData) || orderData.length === 0) {
          console.log(`No user order found with ID ${orderIdNum} for user ${userId}`);
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        order = orderData[0];
        console.log(`Found user order #${orderIdNum}:`, order);
      }
    } catch (dbError) {
      console.error('Error querying order:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    }

    // Get payments
    const payments = await prisma.order_payments.findMany({
      where: {
        order_id: orderIdNum
      },
      select: {
        payment_id: true,
        payment_method: true,
        payment_amount: true,
        payment_date: true,
        transaction_id: true
      }
    });

    // Get order items
    const orderItems = await prisma.order_items.findMany({
      where: {
        order_id: orderIdNum
      },
      include: {
        products: {
          select: {
            product_id: true,
            name: true,
            main_image: true
          }
        },
        product_variation_combinations: {
          select: {
            combination_id: true,
            image_url: true,
            price: true,
            variation_id_1: true,
            variation_id_2: true,
            variation_id_3: true,
            product_variations_product_variation_combinations_variation_id_1Toproduct_variations: {
              select: {
                variation_id: true,
                variation_name: true,
                variation_value: true
              }
            },
            product_variations_product_variation_combinations_variation_id_2Toproduct_variations: {
              select: {
                variation_id: true,
                variation_name: true,
                variation_value: true
              }
            },
            product_variations_product_variation_combinations_variation_id_3Toproduct_variations: {
              select: {
                variation_id: true,
                variation_name: true,
                variation_value: true
              }
            }
          }
        }
      }
    });

    // Get shipping & billing addresses
    let shippingAddress = null;
    let billingAddress = null;

    try {
      if (order.shippingAddressId) {
        shippingAddress = await prisma.addresses.findUnique({
          where: { address_id: order.shippingAddressId }
        });
      }
      
      if (order.billingAddressId) {
        billingAddress = await prisma.addresses.findUnique({
          where: { address_id: order.billingAddressId }
        });
      }
    } catch (addressError) {
      console.error('Error fetching order addresses:', addressError);
    }

    // Format the order for the frontend
    const formattedOrder = {
      ...order,
      orderNumber: `ORD-${order.id.toString().padStart(6, '0')}`,
      totalAmount: order.totalAmount?.toString() || "0",
      subtotal: order.subTotal?.toString() || "0",
      shippingCharge: order.shippingCost?.toString() || "0",
      shippingCost: order.shippingCost?.toString() || "0",
      shipping_method: order.shipping_method || "Standard Shipping",
      orderItems: orderItems.map(item => {
        const variation = item.product_variation_combinations ? {
          id: item.product_variation_combinations.combination_id,
          value: item.variation_details,
          image: item.product_variation_combinations.image_url,
          price: item.product_variation_combinations.price,
          variations: [
            item.product_variation_combinations.product_variations_product_variation_combinations_variation_id_1Toproduct_variations,
            item.product_variation_combinations.product_variations_product_variation_combinations_variation_id_2Toproduct_variations,
            item.product_variation_combinations.product_variations_product_variation_combinations_variation_id_3Toproduct_variations
          ].filter(v => v).map(v => ({
            id: v.variation_id,
            name: v.variation_name,
            value: v.variation_value
          }))
        } : null;
        
        return {
          id: item.product_id,
          quantity: item.quantity,
          price: item.item_price,
          variation: variation,
          product: {
            id: item.products?.product_id,
            name: item.products?.name,
            mainImage: item.products?.main_image
          }
        };
      }) || [],
      shippingAddress: shippingAddress ? {
        id: shippingAddress.address_id,
        fullName: shippingAddress.full_name,
        mobileNo: shippingAddress.mobile_no,
        address: shippingAddress.address,
        city: shippingAddress.city
      } : null,
      billingAddress: billingAddress ? {
        id: billingAddress.address_id,
        fullName: billingAddress.full_name,
        mobileNo: billingAddress.mobile_no,
        address: billingAddress.address,
        city: billingAddress.city
      } : null,
      // For backward compatibility - map OrderPayment to payments
      OrderPayment: payments.map(p => ({
        id: p.payment_id,
        paymentMethod: p.payment_method,
        paymentAmount: p.payment_amount,
        paymentDate: p.payment_date
      })) || [],
      payments: payments.map(p => ({
        id: p.payment_id,
        paymentMethod: p.payment_method,
        paymentAmount: p.payment_amount,
        paymentDate: p.payment_date
      })) || [],
      fullName: shippingAddress?.full_name || 'Customer'
    };

    // Wrap in 'order' property to match what the confirmation page expects
    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
} 