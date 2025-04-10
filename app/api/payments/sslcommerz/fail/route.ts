import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('orderId')
    const errorMessage = url.searchParams.get('error_message')
    
    console.log('SSL Commerz payment failed:', { orderId, errorMessage })
    
    // Clear payment data cookie
    const cookieStore = cookies()
    await cookieStore.delete('ssl_payment_data')
    
    // Redirect back to checkout page with error message
    return NextResponse.redirect(`${url.origin}/checkout/confirmation?orderId=${orderId || ''}&error=${encodeURIComponent(errorMessage || 'Payment failed')}`)
  } catch (error) {
    console.error('SSL Commerz fail callback error:', error)
    return NextResponse.redirect(`${url.origin}/checkout/confirmation?error=Payment processing error`)
  }
} 