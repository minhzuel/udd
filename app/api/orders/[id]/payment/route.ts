import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateAndSaveRewardPoints } from '@/services/reward-points'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id)
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }
    
    const data = await request.json()
    const { paymentMethod, amount, isPartialPayment = false, transactionId = null } = data
    
    if (!paymentMethod || !amount) {
      return NextResponse.json({ 
        error: 'Payment method and amount are required' 
      }, { status: 400 })
    }
    
    console.log('Processing payment:', { orderId, paymentMethod, amount, isPartialPayment, transactionId });
    
    // Process bKash payment
    if (paymentMethod === 'bkash') {
      const { transaction_id } = data
      
      if (!transaction_id) {
        return NextResponse.json(
          { error: 'transaction_id is required for bKash payment' },
          { status: 400 }
        )
      }
      
      // Process bKash payment
      try {
        // Update payment status
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            payment_status: 'paid',
            payment_details: {
              method: 'bkash',
              transaction_id,
              amount: amount,
              is_partial_payment: isPartialPayment
            }
          }
        })
        
        console.log(`bKash payment processed for order ${orderId}. Transaction ID: ${transaction_id}`)
        
        return NextResponse.json({
          success: true,
          message: 'Payment processed successfully',
          order: updatedOrder
        })
      } catch (error) {
        console.error('Error processing bKash payment:', error)
        return NextResponse.json(
          { error: 'Failed to process bKash payment' },
          { status: 500 }
        )
      }
    }
    
    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: isPartialPayment ? 'PARTIAL_PAID' : 'PAID',
        payments: {
          create: {
            paymentMethod,
            paymentAmount: amount,
            paymentDate: new Date(),
            transactionId
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                mainImage: true
              }
            }
          }
        },
        payments: true,
        user: true
      }
    })
    
    // If order is fully paid, calculate and award reward points
    if (!isPartialPayment && updatedOrder.user) {
      try {
        // Check if reward points have already been awarded for this order
        const existingRewardPoints = await prisma.rewardPoint.findFirst({
          where: {
            orderId: updatedOrder.id,
            userId: updatedOrder.user.id
          }
        });
        
        // Only award points if none exist yet
        if (!existingRewardPoints) {
          // Format order items for reward points calculation
          const formattedItems = updatedOrder.orderItems.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.itemPrice)
          }));
          
          // Calculate and save reward points
          const rewardPointsResult = await calculateAndSaveRewardPoints({
            userId: updatedOrder.user.id,
            orderId: updatedOrder.id,
            orderAmount: Number(updatedOrder.totalAmount),
            orderItems: formattedItems
          });
          
          console.log('Reward points awarded during payment:', rewardPointsResult);
        } else {
          console.log(`Reward points already exist for order #${updatedOrder.id}, skipping award`);
        }
      } catch (rewardError) {
        // Log error but don't fail the payment process
        console.error('Error awarding reward points:', rewardError);
      }
    }
    
    return NextResponse.json({ 
      order: updatedOrder,
      message: 'Payment processed successfully' 
    })
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 