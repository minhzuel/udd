import { NextResponse } from 'next/server'
import { executePayment, queryPayment } from '../helpers'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { paymentID } = data
    
    console.log('bKash payment execution for paymentID:', paymentID)
    
    if (!paymentID) {
      return NextResponse.json({ 
        status: 'error',
        error: 'Payment ID is required' 
      }, { status: 400 })
    }
    
    // Get token from cookies
    const cookieStore = cookies();
    const token = await cookieStore.get('bkash_token')?.value
    
    if (!token) {
      return NextResponse.json({ 
        status: 'error',
        error: 'bKash token not found' 
      }, { status: 400 })
    }
    
    // Get payment data from cookies
    const paymentDataCookie = await cookieStore.get('bkash_payment_data')?.value
    
    if (!paymentDataCookie) {
      return NextResponse.json({ 
        status: 'error',
        error: 'Payment data not found' 
      }, { status: 400 })
    }
    
    const paymentData = JSON.parse(paymentDataCookie)
    const { orderId, amount, isPartialPayment } = paymentData
    
    console.log('bKash payment data from cookie:', paymentData)
    
    // Execute payment
    try {
      const executeResponse = await executePayment(paymentID, token)
      console.log('bKash execute payment response:', executeResponse)
      
      // Check if execution was successful
      if (executeResponse.statusCode === '0000' && executeResponse.transactionStatus === 'Completed') {
        // Payment successful, update order status
        const updatedOrder = await updateOrderWithPayment(orderId, amount, isPartialPayment, executeResponse.trxID);
        
        // Clear cookies
        await cookieStore.delete('bkash_token')
        await cookieStore.delete('bkash_payment_data')
        
        console.log('bKash payment completed successfully for order:', orderId)
        
        return NextResponse.json({
          status: 'success',
          success: true,
          order: updatedOrder,
          transaction: {
            trxID: executeResponse.trxID,
            amount: executeResponse.amount,
            paymentID: executeResponse.paymentID,
            merchantInvoiceNumber: executeResponse.merchantInvoiceNumber
          }
        })
      } 
      // Handle case when payment is initiated but not yet completed
      else if (executeResponse.statusMessage === 'Initiated the payment') {
        // Query the payment status
        const queryResponse = await queryPayment(paymentID, token)
        console.log('bKash query payment response:', queryResponse)
        
        if (queryResponse.transactionStatus === 'Completed') {
          // Payment successful, update order status
          const updatedOrder = await updateOrderWithPayment(orderId, amount, isPartialPayment, queryResponse.trxID);
          
          // Clear cookies
          await cookieStore.delete('bkash_token')
          await cookieStore.delete('bkash_payment_data')
          
          console.log('bKash payment completed via query for order:', orderId)
          
          return NextResponse.json({
            status: 'success',
            success: true,
            order: updatedOrder,
            transaction: {
              trxID: queryResponse.trxID,
              amount: queryResponse.amount,
              paymentID: queryResponse.paymentID,
              merchantInvoiceNumber: queryResponse.merchantInvoiceNumber
            }
          })
        }
      }
      
      // If we get here, the payment was not successful
      return NextResponse.json({ 
        status: 'error',
        success: false,
        error: 'Payment execution failed',
        details: executeResponse
      }, { status: 400 })
    } catch (error) {
      console.error('bKash payment execution error:', error)
      return NextResponse.json({ 
        status: 'error',
        success: false,
        error: 'Failed to execute bKash payment',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 400 })
    }
  } catch (error) {
    console.error('bKash payment execution error:', error)
    return NextResponse.json({ 
      status: 'error',
      success: false,
      error: 'Failed to execute bKash payment',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Helper function to update order with payment details
async function updateOrderWithPayment(orderId: number, amount: number, isPartialPayment: boolean, transactionId: string) {
  try {
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: isPartialPayment ? 'PARTIAL_PAID' : 'PAID',
        payments: {
          create: {
            paymentMethod: 'bkash',
            paymentAmount: amount,
            paymentDate: new Date(),
            transactionId: transactionId
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
        payments: true
      }
    });
  } catch (error) {
    console.error('Error updating order with payment:', error);
    throw error;
  }
} 