import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('orderId')
    
    console.log('SSL Commerz payment cancelled:', { orderId })
    
    // Clear payment data cookie
    const cookieStore = cookies()
    await cookieStore.delete('ssl_payment_data')
    
    // Redirect back to checkout page
    return NextResponse.redirect(`${url.origin}/checkout/confirmation?orderId=${orderId || ''}&message=Payment cancelled`)
  } catch (error) {
    console.error('SSL Commerz cancel callback error:', error)
    return NextResponse.redirect(`${url.origin}/checkout/confirmation?error=Payment processing error`)
  }
} 