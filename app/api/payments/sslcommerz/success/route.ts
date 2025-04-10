import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('orderId')
    const transactionId = url.searchParams.get('tran_id')
    const amount = url.searchParams.get('amount')
    const status = url.searchParams.get('status')
    
    console.log('SSL Commerz success callback:', { orderId, transactionId, amount, status })
    
    if (!orderId || !transactionId) {
      return NextResponse.redirect(`${url.origin}/checkout/confirmation?orderId=${orderId || ''}&error=Invalid payment response`)
    }
    
    // Get payment data from cookies
    const cookieStore = cookies()
    const paymentDataCookie = await cookieStore.get('ssl_payment_data')?.value
    
    let paymentData = null
    if (paymentDataCookie) {
      paymentData = JSON.parse(paymentDataCookie)
      console.log('SSL payment data from cookie:', paymentData)
    }
    
    // Verify if it's the same transaction
    if (paymentData && paymentData.transactionId !== transactionId) {
      console.error('Transaction ID mismatch', {
        cookie: paymentData.transactionId,
        callback: transactionId
      })
    }
    
    const orderIdNumber = parseInt(orderId as string)
    if (isNaN(orderIdNumber)) {
      return NextResponse.redirect(`${url.origin}/checkout/confirmation?error=Invalid order ID`)
    }
    
    // Update order payment status in database
    try {
      const isPartialPayment = paymentData?.isPartialPayment || false
      const paymentAmount = paymentData?.amount || parseFloat(amount || '0')
      
      const updatedOrder = await prisma.order.update({
        where: { id: orderIdNumber },
        data: {
          orderStatus: isPartialPayment ? 'PARTIAL_PAID' : 'PAID',
          payments: {
            create: {
              paymentMethod: 'card', // SSL Commerz is card payment
              paymentAmount: paymentAmount,
              paymentDate: new Date(),
              transactionId: transactionId
            }
          }
        }
      })
      
      console.log(`SSL payment completed successfully for order: ${orderId}`)
      
      // Clear the payment cookie
      await cookieStore.delete('ssl_payment_data')
      
      // Redirect to order success page
      return NextResponse.redirect(`${url.origin}/orders/${orderId}?paymentStatus=success`)
    } catch (error) {
      console.error('Error updating order payment status:', error)
      return NextResponse.redirect(`${url.origin}/checkout/confirmation?orderId=${orderId}&error=Payment verification failed`)
    }
  } catch (error) {
    console.error('SSL Commerz success callback error:', error)
    return NextResponse.redirect(`${url.origin}/checkout/confirmation?error=Payment processing error`)
  }
} 