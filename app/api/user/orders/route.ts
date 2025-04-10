import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function GET(request: Request) {
  try {
    // Get user ID from session
    const userId = await getSessionUserId(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Get query parameters for filtering
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const forChat = url.searchParams.get('for') === 'chat'

    // Debug log
    console.log(`Fetching orders for user: ${userId}, forChat: ${forChat}, status: ${status || 'ALL'}`)

    // For chat, return simplified data
    if (forChat) {
      try {
        const orders = await prisma.orders.findMany({
          where: {
            user_id: userId
          },
          select: {
            order_id: true,
            total_amount: true,
            order_date: true,
            order_status: true,
          },
          orderBy: {
            order_date: 'desc'
          },
          take: limit
        })

        const simplifiedOrders = orders.map(order => ({
          id: order.order_id,
          totalAmount: order.total_amount?.toString() || "0",
          orderDate: order.order_date,
          status: order.order_status || 'active',
          orderNumber: `ORD-${order.order_id.toString().padStart(6, '0')}`
        }))

        return NextResponse.json(simplifiedOrders)
      } catch (error) {
        console.error('Error fetching orders for chat:', error)
        return NextResponse.json(
          { error: 'Database error', message: 'Could not load orders for chat', details: error.message }, 
          { status: 500 }
        )
      }
    } 
    
    // For the orders page, return full order data
    else {
      // Get user addresses
      let userAddresses = [];
      try {
        userAddresses = await prisma.addresses.findMany({
          where: { user_id: userId, is_guest_address: false }
        });
      } catch (addrError) {
        console.error('Error fetching user addresses:', addrError)
      }

      try {
        // Build where clause - handle status as a string field not an enum
        let whereClause: any = { user_id: userId };
        
        // Only add status filter if it's not ALL
        if (status && status !== 'ALL') {
          // Use string comparison instead of enum
          whereClause.order_status = {
            equals: status,
            mode: 'insensitive' // Case insensitive
          };
        }
        
        // Get orders with correct field names from the schema
        // Removing fields that don't exist in the schema
        const orders = await prisma.$queryRaw`
          SELECT 
            "order_id" as id, 
            "order_date" as "orderDate", 
            "order_status"::text as "orderStatus", 
            "total_amount" as "totalAmount",
            "shipping_address_id" as "shippingAddressId",
            "billing_address_id" as "billingAddressId"
          FROM "orders" 
          WHERE "user_id" = ${userId}
          ORDER BY "order_date" DESC
        `;

        // Get order payments separately
        const orderIds = orders.map(order => order.id);
        let orderPayments = [];
        let orderItems = [];
        
        if (orderIds.length > 0) {
          // Fetch payments
          orderPayments = await prisma.order_payments.findMany({
            where: {
              order_id: {
                in: orderIds
              }
            },
            select: {
              payment_id: true,
              payment_method: true,
              payment_amount: true,
              payment_date: true,
              order_id: true
            }
          });
          
          // Fetch order items
          orderItems = await prisma.order_items.findMany({
            where: {
              order_id: {
                in: orderIds
              }
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
                  variation_id_3: true
                }
              }
            }
          });
        }
        
        // Create a map of payments and items by order ID
        const paymentsByOrderId = {};
        orderPayments.forEach(payment => {
          if (!paymentsByOrderId[payment.order_id]) {
            paymentsByOrderId[payment.order_id] = [];
          }
          paymentsByOrderId[payment.order_id].push({
            id: payment.payment_id,
            paymentMethod: payment.payment_method,
            paymentAmount: payment.payment_amount,
            paymentDate: payment.payment_date
          });
        });
        
        const itemsByOrderId = {};
        orderItems.forEach(item => {
          if (!itemsByOrderId[item.order_id]) {
            itemsByOrderId[item.order_id] = [];
          }
          itemsByOrderId[item.order_id].push(item);
        });

        // Get addresses if needed
        let shippingAddresses = {};
        let billingAddresses = {};
        
        if (orders.some(o => o.shippingAddressId || o.billingAddressId)) {
          const addressIds = new Set();
          orders.forEach(order => {
            if (order.shippingAddressId) addressIds.add(order.shippingAddressId);
            if (order.billingAddressId) addressIds.add(order.billingAddressId);
          });
          
          if (addressIds.size > 0) {
            try {
              const addresses = await prisma.addresses.findMany({
                where: {
                  address_id: {
                    in: Array.from(addressIds) as number[]
                  }
                },
                select: {
                  address_id: true,
                  full_name: true,
                  mobile_no: true,
                  address: true,
                  city: true
                }
              });
              
              addresses.forEach(addr => {
                shippingAddresses[addr.address_id] = {
                  id: addr.address_id,
                  fullName: addr.full_name,
                  mobileNo: addr.mobile_no,
                  address: addr.address,
                  city: addr.city
                };
                billingAddresses[addr.address_id] = {
                  id: addr.address_id,
                  fullName: addr.full_name,
                  mobileNo: addr.mobile_no,
                  address: addr.address,
                  city: addr.city
                };
              });
            } catch (addrError) {
              console.error('Error fetching order addresses:', addrError)
            }
          }
        }

        // Format orders for frontend consumption
        const formattedOrders = orders.map(order => {
          // Handle order items safely
          let safeOrderItems = [];
          try {
            const items = itemsByOrderId[order.id] || [];
            safeOrderItems = items.map(item => {
              // Create a properly formatted product object
              const productData = item.products ? {
                id: item.products.product_id,
                product_id: item.products.product_id,
                name: item.products.name,
                main_image: item.products.main_image,
                // Add camelCase versions for compatibility
                mainImage: item.products.main_image
              } : null;
              
              // Create a properly formatted variation combination object
              const combinationData = item.product_variation_combinations ? {
                combination_id: item.product_variation_combinations.combination_id,
                image_url: item.product_variation_combinations.image_url,
                price: item.product_variation_combinations.price,
                variation_id_1: item.product_variation_combinations.variation_id_1,
                variation_id_2: item.product_variation_combinations.variation_id_2,
                variation_id_3: item.product_variation_combinations.variation_id_3,
                // Add camelCase versions for compatibility
                imageUrl: item.product_variation_combinations.image_url
              } : null;
              
              return {
                ...item,
                product: productData,
                product_variation_combinations: combinationData
              };
            });
          } catch (itemError) {
            console.error('Error processing order items:', itemError);
          }
          
          // Get full name from shipping address as a fallback
          const shippingAddr = order.shippingAddressId && shippingAddresses[order.shippingAddressId]
            ? shippingAddresses[order.shippingAddressId] 
            : null;
          
          // Get order payments
          const orderPayment = paymentsByOrderId[order.id] || [];
          
          return {
            id: order.id,
            orderDate: order.orderDate,
            orderNumber: `ORD-${order.id.toString().padStart(6, '0')}`,
            totalAmount: order.totalAmount?.toString() || "0",
            orderStatus: order.orderStatus,
            shippingMethod: "Standard Shipping", // Default value
            // Use shipping address name as fallback
            fullName: shippingAddr?.fullName || 'Customer',
            email: null,
            mobileNo: null,
            // Include both field names for compatibility
            OrderPayment: orderPayment,
            payments: orderPayment, // Map OrderPayment to payments for backward compatibility
            orderItems: safeOrderItems,
            shippingAddress: shippingAddr,
            billingAddress: order.billingAddressId && billingAddresses[order.billingAddressId]
              ? billingAddresses[order.billingAddressId] : null
          };
        });

        return NextResponse.json({ orders: formattedOrders, userAddresses })
      } catch (error) {
        console.error('Error fetching orders for account page:', error)
        return NextResponse.json(
          { error: 'Database error', message: 'Could not load your order history', details: error.message }, 
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('Error in user/orders route:', error)
    return NextResponse.json(
      { error: 'Server error', message: 'An unexpected error occurred', details: error.message }, 
      { status: 500 }
    )
  }
} 