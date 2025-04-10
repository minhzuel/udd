import { NextResponse } from 'next/server'
import { getToken, createPayment } from '../helpers'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { orderId, amount, isPartialPayment = false, currency = 'BDT', displayCurrency = 'BDT' } = data
    
    console.log('bKash payment initialization data:', { 
      orderId, 
      amount, 
      isPartialPayment, 
      currency,
      displayCurrency 
    })
    
    // Validate required parameters
    if (!orderId) {
      return NextResponse.json({ 
        error: 'Order ID is required' 
      }, { status: 400 })
    }
    
    // Validate amount explicitly but allow 0
    const numericAmount = parseFloat(String(amount || '0'));
    
    if (isNaN(numericAmount)) {
      return NextResponse.json({ 
        error: 'Valid payment amount is required',
        details: `Received amount: ${amount}, type: ${typeof amount}`
      }, { status: 400 })
    }
    
    // Ensure amount is greater than 0
    if (numericAmount <= 0) {
      return NextResponse.json({ 
        error: 'Payment amount must be greater than zero',
        details: `Received amount: ${numericAmount}`
      }, { status: 400 })
    }
    
    // bKash only supports BDT
    if (currency !== 'BDT') {
      console.warn(`Currency ${currency} provided, but bKash only supports BDT. Proceeding with amount as BDT.`);
    }
    
    console.log(`Using numeric amount for bKash payment: ${numericAmount} BDT (display currency: ${displayCurrency})`);
    
    // Generate invoice number
    const invoiceId = `INV-${orderId}-${Date.now()}`;
    
    // Get bKash token
    let token;
    try {
      token = await getToken()
      console.log('bKash token obtained successfully:', token.substring(0, 10) + '...');
    } catch (tokenError) {
      console.error('bKash token error:', tokenError)
      return NextResponse.json({ 
        error: 'Failed to get bKash token', 
        details: tokenError instanceof Error ? tokenError.message : String(tokenError)
      }, { status: 400 })
    }
    
    // Create payment
    let paymentResponse;
    try {
      paymentResponse = await createPayment(numericAmount, orderId, token)
      console.log('bKash payment creation response:', paymentResponse)
    } catch (paymentError) {
      console.error('bKash payment creation error:', paymentError)
      return NextResponse.json({ 
        error: 'Failed to create bKash payment',
        details: paymentError instanceof Error ? paymentError.message : String(paymentError)
      }, { status: 400 })
    }
    
    if (paymentResponse.errorCode) {
      console.error('bKash payment creation error code:', paymentResponse)
      return NextResponse.json({ 
        error: paymentResponse.errorMessage || 'bKash payment creation failed',
        details: paymentResponse
      }, { status: 400 })
    }
    
    if (!paymentResponse.paymentID) {
      console.error('bKash payment response missing paymentID:', paymentResponse)
      return NextResponse.json({ 
        error: 'Invalid bKash payment response - missing paymentID',
        details: paymentResponse
      }, { status: 400 })
    }
    
    // Store payment info in the session/cookie
    const cookieStore = cookies();
    
    // Store the token
    await cookieStore.set('bkash_token', token, { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 3600 // 1 hour
    });
    
    // Store payment data
    await cookieStore.set('bkash_payment_data', JSON.stringify({
      orderId,
      amount: numericAmount,
      isPartialPayment,
      paymentID: paymentResponse.paymentID,
      invoiceId,
      currency
    }), { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 3600 // 1 hour
    });
    
    console.log('bKash payment initialized successfully:', paymentResponse.paymentID);
    
    return NextResponse.json({
      status: 'success',
      paymentID: paymentResponse.paymentID,
      amount: numericAmount,
      orderId: orderId,
      isPartialPayment: isPartialPayment,
      currency: currency,
      raw_response: paymentResponse
    });
  } catch (error) {
    console.error('bKash payment initialization error:', error)
    return NextResponse.json({ 
      status: 'error',
      error: 'Failed to initialize bKash payment',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}