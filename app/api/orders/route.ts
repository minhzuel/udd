import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { redeemRewardPoints } from '@/services/reward-points'
import jwt from 'jsonwebtoken'
import { calculateAndSaveRewardPoints } from '@/services/reward-points'

// Helper function to normalize product structure
function normalizeProduct(product: any) {
  if (!product) return product;
  
  // Add a compatibility layer for variation combinations
  if (product.product_variation_combinations && !product.variationCombinations) {
    product.variationCombinations = product.product_variation_combinations;
  }
  
  return product;
}

interface OrderItem {
  id: number
  quantity: number
  price: number
  variation?: {
    id: number | null
    name: string
    value: string
    price: number
  }
  variationDetails?: string
}

export async function POST(request: Request) {
  try {
    // Check for existing session (logged in user)
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const sessionCookie = cookies['session'];
    let loggedInUserId = null;
    
    if (sessionCookie) {
      try {
        loggedInUserId = parseInt(sessionCookie);
        if (isNaN(loggedInUserId)) {
          loggedInUserId = null;
        } else {
          console.log('User is logged in with ID:', loggedInUserId);
        }
      } catch (e) {
        console.error('Error parsing session cookie:', e);
      }
    }

    let body;
    try {
      const rawBody = await request.text()
      console.log('Received raw request body:', rawBody)
      body = JSON.parse(rawBody)
      console.log('Parsed request body:', JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: 'The request body must be valid JSON'
        },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'mobile', 'shippingMethod', 'items', 'totalAmount']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: `Missing fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Validate address information
    if (loggedInUserId) {
      // For logged-in users, validate address IDs
      if (!body.shippingAddressId) {
        console.error('Missing shipping address ID for logged-in user')
        return NextResponse.json(
          { 
            error: 'Missing shipping address',
            details: 'Shipping address ID is required'
          },
          { status: 400 }
        )
      }
      
      if (!body.billingAddressId) {
        console.error('Missing billing address ID for logged-in user')
        return NextResponse.json(
          { 
            error: 'Missing billing address',
            details: 'Billing address ID is required'
          },
          { status: 400 }
        )
      }
    } else {
      // For guest users, validate address fields
      if (!body.address) {
        console.error('Missing address for guest user')
        return NextResponse.json(
          { 
            error: 'Missing address',
            details: 'Address is required for guest users'
          },
          { status: 400 }
        )
      }
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      console.error('Invalid items array:', body.items)
      return NextResponse.json(
        { 
          error: 'Invalid items',
          details: 'Items must be a non-empty array'
        },
        { status: 400 }
      )
    }

    // Get all product IDs from the order items
    const productIds = body.items.map((item: OrderItem) => parseInt(item.id.toString()))
    console.log('Processing order for product IDs:', productIds)

    try {
      // Fetch all products in a single query
      const products = await prisma.products.findMany({
        where: {
          product_id: {
            in: productIds
          }
        },
        include: {
          ProductToVariation: {
            include: {
              product_variations: true
            }
          },
          product_variation_combinations: true
        }
      })

      console.log('Found products:', JSON.stringify(products, null, 2))

      // Map products to include variationCombinations 
      const mappedProducts = products.map(product => {
        return {
          ...product,
          variationCombinations: product.product_variation_combinations
        }
      });

      // Check stock availability
      for (const item of body.items) {
        const itemId = parseInt(item.id.toString())
        const product = mappedProducts.find(p => p.product_id === itemId)
        if (!product) {
          console.error('Product not found:', itemId)
          return NextResponse.json(
            { 
              error: 'Product not found',
              details: `Product with ID ${itemId} not found`
            },
            { status: 404 }
          )
        }

        // Check if the variation has a valid ID that needs stock checking
        if (item.variation && item.variation.id && parseInt(item.variation.id.toString()) > 0) {
          // Find the variation combination that matches the item
          const variationId = parseInt(item.variation.id.toString());
          const variationCombination = product.variationCombinations.find(combo => 
            combo.combination_id === variationId
          );

          if (!variationCombination) {
            console.error('Variation combination not found:', {
              product: product.name,
              requestedVariationId: variationId,
              availableCombinations: product.variationCombinations.map(vc => ({
                id: vc.combination_id
              }))
            })
            return NextResponse.json(
              { 
                error: 'Variation not found',
                details: `No matching variation found for product ${product.name} with ID: ${variationId}`
              },
              { status: 404 }
            )
          }

          if (variationCombination.stock_quantity < item.quantity) {
            console.error('Insufficient stock for variation:', {
              product: product.name,
              variation: variationCombination.combination_id,
              requested: item.quantity,
              available: variationCombination.stock_quantity
            })
            return NextResponse.json(
              { 
                error: 'Insufficient stock',
                details: `Only ${variationCombination.stock_quantity} units available for variation of product ${product.name}`
              },
              { status: 400 }
            )
          }
        } else if (item.variation && item.variation.id === null) {
          // This is a descriptive variation only, not tied to inventory
          // Allow the order to proceed without checking variation stock
          console.log('Processing descriptive variation for product:', {
            product: product.name,
            variation: item.variation.name + ': ' + item.variation.value,
            usingMainProductStock: true
          });
          
          // Check main product stock since we can't check specific variation
          if (product.stock_quantity < item.quantity) {
            console.error('Insufficient stock for product:', {
              product: product.name,
              requested: item.quantity,
              available: product.stock_quantity
            })
            return NextResponse.json(
              { 
                error: 'Insufficient stock',
                details: `Only ${product.stock_quantity} units available for product ${product.name}`
              },
              { status: 400 }
            )
          }
        } else if (product.stock_quantity < item.quantity) {
          // If no variation ID, check main product stock
          console.error('Insufficient stock for product:', {
            product: product.name,
            requested: item.quantity,
            available: product.stock_quantity
          })
          return NextResponse.json(
            { 
              error: 'Insufficient stock',
              details: `Only ${product.stock_quantity} units available for product ${product.name}`
            },
            { status: 400 }
          )
        }
      }

      // Create order with items in a single transaction
      const order = await prisma.$transaction(async (tx) => {
        try {
          // For logged-in users, fetch the shipping and billing addresses
          let shippingAddress;
          let billingAddress;
          
          if (loggedInUserId) {
            // Fetch shipping address
            shippingAddress = await tx.addresses.findUnique({
              where: {
                address_id: body.shippingAddressId,
                user_id: loggedInUserId
              }
            });
            
            if (!shippingAddress) {
              throw new Error(`Shipping address with ID ${body.shippingAddressId} not found for user ${loggedInUserId}`);
            }
            
            // Fetch billing address
            billingAddress = await tx.addresses.findUnique({
              where: {
                address_id: body.billingAddressId,
                user_id: loggedInUserId
              }
            });
            
            if (!billingAddress) {
              throw new Error(`Billing address with ID ${body.billingAddressId} not found for user ${loggedInUserId}`);
            }
          } else {
            // For guest users, create new addresses
            shippingAddress = await tx.addresses.create({
              data: {
                address: body.address,
                city: body.city || '', // Default empty string for required field
                full_name: body.fullName,
                mobile_no: body.mobile,
                is_guest_address: true
              }
            });
            
            // If billing address is different from shipping address
            if (body.billingAddress && body.billingAddress !== body.address) {
              billingAddress = await tx.addresses.create({
                data: {
                  address: body.billingAddress,
                  city: body.billingCity || '', 
                  full_name: body.fullName,
                  mobile_no: body.mobile,
                  is_guest_address: true
                }
              });
            } else {
              // Use the same address for billing
              billingAddress = shippingAddress;
            }
          }

          // Use logged in user if available, otherwise check for existing user or create new one
          let userId = loggedInUserId;
          
          if (!userId) {
            // Check if a user exists with the provided email
            const existingUser = await tx.users.findFirst({
              where: { 
                email: body.email,
                is_guest: false // Only find real users, not guests
              }
            });

            if (existingUser) {
              // If user exists, associate the order with them
              userId = existingUser.user_id;
              console.log(`Found existing user with ID: ${userId}`);
            } else {
              // For guest checkout, we'll create a temporary user with minimal information
              const newUser = await tx.users.create({
                data: {
                  full_name: body.fullName,
                  email: body.email,
                  mobile_no: body.mobile,
                  is_guest: true, // Flag to indicate this is a guest account
                  user_type: 'customer'
                }
              });
              userId = newUser.user_id;
              console.log(`Created guest user with ID: ${userId}`);
            }
          }

          // Fetch shipping method details
          let shippingMethodId: number;
          try {
            shippingMethodId = parseInt(body.shippingMethod);
            if (isNaN(shippingMethodId)) {
              throw new Error(`Invalid shipping method ID: ${body.shippingMethod}`);
            }
          } catch (error) {
            throw new Error(`Invalid shipping method ID: ${body.shippingMethod}`);
          }
          
          // Fetch shipping method details
          const shippingMethod = await tx.shipping_methods.findUnique({
            where: {
              shipping_method_id: shippingMethodId
            }
          })
          
          if (!shippingMethod) {
            throw new Error(`Shipping method with ID ${shippingMethodId} not found`)
          }
          
          const subtotal = body.subtotal
          const totalAmount = body.totalAmount
          const shippingCost = shippingMethod.base_cost // Use the base_cost from the shipping method
          
          // Set the order date to now
          const orderDate = new Date()

          // Process orderItems data for creation
          const processedItems = body.items.map((item: OrderItem) => {
            const productId = parseInt(item.id.toString());
            let variationDetails = '';
            let combinationId = null;
            
            // Process variation if present
            if (item.variation) {
              variationDetails = item.variation.value;
              
              // Structured variation to save
              if (item.variation.id && parseInt(item.variation.id.toString()) > 0) {
                combinationId = parseInt(item.variation.id.toString());
              }
            }
            
            return {
              productId,
              quantity: item.quantity,
              itemPrice: item.variation && item.variation.price ? item.variation.price : item.price,
              variation_details: variationDetails,
              combinationId
            };
          });

          // Create the order using raw SQL to avoid enum validation issues
          const [newOrder] = await tx.$queryRaw`
            INSERT INTO "orders" (
              "user_id",
              "order_date",
              "subtotal",
              "total_amount",
              "shipping_charge",
              "shipping_address_id",
              "billing_address_id",
              "shipping_method",
              "order_status",
              "full_name",
              "mobile_no",
              "email"
            ) VALUES (
              ${userId},
              ${orderDate},
              ${subtotal},
              ${totalAmount},
              ${shippingCost},
              ${shippingAddress.address_id},
              ${billingAddress.address_id},
              ${shippingMethod.name},
              'PENDING',
              ${body.fullName},
              ${body.mobile},
              ${body.email}
            )
            RETURNING "order_id" as id
          `;

          console.log('Order created successfully with ID:', newOrder.id);

          // Create order items for this order 
          const createdOrderItems = [];
          for (const item of processedItems) {
            const orderItem = await tx.order_items.create({
              data: {
                order_id: newOrder.id,
                product_id: item.productId,
                quantity: item.quantity,
                item_price: item.itemPrice,
                variation_details: item.variation_details
              }
            });
            
            // Add product variation combination if available
            if (item.combinationId) {
              await tx.order_items.update({
                where: { order_item_id: orderItem.order_item_id },
                data: {
                  product_variation_combinations: {
                    connect: { combination_id: item.combinationId }
                  }
                }
              });
            }
            
            createdOrderItems.push(orderItem);
          }

          // Update stock quantities
          for (const item of processedItems) {
            // Check if the variation has a valid ID that needs stock updating
            if (item.combinationId) {
              console.log(`Reducing stock for variation combination ID: ${item.combinationId} by ${item.quantity} units`);
              
              // Update variation stock
              await tx.product_variation_combinations.update({
                where: {
                  combination_id: item.combinationId
                },
                data: {
                  stock_quantity: {
                    decrement: item.quantity
                  }
                }
              });
            }
          }

          // Redeem reward points if used
          if (userId && body.rewardPointsUsed && body.rewardPointsUsed > 0) {
            try {
              // Store reward points data in separate table
              await tx.reward_points.create({
                data: {
                  user_id: userId,
                  order_id: newOrder.id,
                  points: -body.rewardPointsUsed, // negative for points used
                  earned_date: new Date(),
                  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  is_used: true
                }
              });
              
              console.log(`Stored reward points usage: ${body.rewardPointsUsed} points for order #${newOrder.id}`);
              
              // Update existing reward points to mark them as used
              const availablePoints = await tx.reward_points.findMany({
                where: {
                  user_id: userId,
                  is_used: false,
                  points: {
                    gt: 0 // Only positive (earned) points
                  },
                  expiry_date: {
                    gte: new Date() // Not expired
                  }
                },
                orderBy: {
                  expiry_date: 'asc' // Use oldest points first
                }
              });
              
              let remainingPointsToUse = body.rewardPointsUsed;
              
              for (const point of availablePoints) {
                if (remainingPointsToUse <= 0) break;
                
                const pointsToUse = Math.min(point.points, remainingPointsToUse);
                remainingPointsToUse -= pointsToUse;
                
                // Mark these points as used
                await tx.reward_points.update({
                  where: { reward_point_id: point.reward_point_id },
                  data: { 
                    is_used: true,
                    order_id: newOrder.id
                  }
                });
              }
            } catch (pointsError) {
              console.error('Error recording reward points usage:', pointsError);
            }
          }

          // Calculate reward points for the order
          if (userId) {
            try {
              console.log(`===== REWARD POINTS CALCULATION =====`);
              console.log(`Starting reward points calculation for order #${newOrder.id}`);
              
              // 1. Calculate points based on order total (1 point per 100 taka)
              const orderTotalPoints = Math.floor(parseFloat(totalAmount) / 100);
              
              // 2. Calculate points based on products
              let productPoints = 0;
              for (const item of processedItems) {
                // Get product details
                const product = await tx.products.findUnique({
                  where: { product_id: item.productId },
                  include: {
                    product_reward_rules: {
                      include: {
                        reward_rule: true
                      }
                    }
                  }
                });
                
                if (product && product.product_reward_rules.length > 0) {
                  // Find the highest priority active rule
                  const activeRules = product.product_reward_rules
                    .filter(rule => rule.reward_rule.is_active)
                    .sort((a, b) => (b.reward_rule.priority || 0) - (a.reward_rule.priority || 0));
                  
                  if (activeRules.length > 0) {
                    const rule = activeRules[0];
                    // Calculate points based on quantity and rule
                    productPoints += item.quantity * (rule.points_per_unit || 0);
                  }
                }
              }
              
              // 3. Calculate total points (order total + product points)
              const totalPoints = orderTotalPoints + productPoints;
              
              if (totalPoints > 0) {
                // Create reward points record
                const rewardPoint = await tx.reward_points.create({
                  data: {
                    user_id: userId,
                    order_id: newOrder.id,
                    points: totalPoints,
                    earned_date: new Date(),
                    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
                    is_used: false
                  }
                });
                
                console.log(`Created reward point record with ID: ${rewardPoint.reward_point_id}`);
                console.log(`Points breakdown for order #${newOrder.id}:`);
                console.log(`- Order total points: ${orderTotalPoints}`);
                console.log(`- Product points: ${productPoints}`);
                console.log(`- Total points earned: ${totalPoints}`);
              } else {
                console.log(`No reward points earned for order #${newOrder.id} (order total too low and no product rules)`);
              }
              
              console.log(`===== END REWARD POINTS CALCULATION =====`);
            } catch (rewardError) {
              console.error(`REWARD POINTS ERROR: ${rewardError instanceof Error ? rewardError.message : 'Unknown error'}`, rewardError instanceof Error ? rewardError.stack : '');
              console.error(`Failed to calculate reward points for order #${newOrder.id}`);
            }
          } else {
            console.log('No user ID found, skipping reward points calculation');
          }

          // Format the order for the response
          return {
            id: newOrder.id,
            orderItems: createdOrderItems,
            orderNumber: `ORD-${newOrder.id.toString().padStart(6, '0')}`
          };
        } catch (txError) {
          console.error('Transaction error:', txError)
          throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : 'Unknown error'}`)
        }
      })

      return NextResponse.json({ 
        order,
        message: 'Order created successfully'
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { 
          error: 'Database error',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error occurred'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}