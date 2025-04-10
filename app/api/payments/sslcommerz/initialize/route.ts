import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SSL_STORE_ID = "ma64e33180b0ec9"
const SSL_STORE_PASSWORD = "ma64e33180b0ec9@ssl"
const SSL_SANDBOX_URL = "https://sandbox.sslcommerz.com/gwprocess/v3/api.php"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { orderId, amount, isPartialPayment = false, currency = 'BDT', displayCurrency = 'BDT' } = data
    
    console.log('SSL Commerz payment initialization data:', { 
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
    
    // Validate amount explicitly
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
    
    // SSL Commerz only accepts BDT for Bangladesh transactions
    if (currency !== 'BDT') {
      console.warn(`Currency ${currency} provided, but SSL Commerz requires BDT. Proceeding with amount as BDT.`);
    }
    
    console.log(`Using numeric amount for SSL payment: ${numericAmount} BDT (display currency: ${displayCurrency})`);
    
    // Generate transaction ID
    const transactionId = `SSLCZ_${orderId}_${Date.now()}`
    
    // Prepare post data for SSL Commerz
    const postData = {
      store_id: SSL_STORE_ID,
      store_passwd: SSL_STORE_PASSWORD,
      total_amount: numericAmount.toString(),
      currency: 'BDT', // SSL Commerz requires BDT for Bangladesh transactions
      tran_id: transactionId,
      success_url: `${BASE_URL}/api/payments/sslcommerz/success?orderId=${orderId}`,
      fail_url: `${BASE_URL}/api/payments/sslcommerz/fail?orderId=${orderId}`,
      cancel_url: `${BASE_URL}/api/payments/sslcommerz/cancel?orderId=${orderId}`,
      emi_option: "0",
      cus_name: "Customer",
      cus_email: "customer@example.com",
      cus_phone: "01700000000",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      shipping_method: "NO",
      product_name: `Order #${orderId}`,
      product_category: "General",
      product_profile: "general"
    }
    
    console.log('SSL Commerz POST data:', {
      amount: postData.total_amount,
      currency: postData.currency,
      tran_id: postData.tran_id
    });
    
    // Make API request to SSL Commerz
    const response = await fetch(SSL_SANDBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(postData as any).toString()
    })
    
    if (!response.ok) {
      console.error('SSL Commerz API error:', {
        status: response.status,
        statusText: response.statusText
      })
      return NextResponse.json({ 
        error: 'Failed to connect with payment gateway',
        details: `Status: ${response.status}`
      }, { status: 400 })
    }
    
    const sslResponse = await response.json()
    console.log('SSL Commerz API response:', sslResponse)
    
    // Add more detailed logging of SSL response
    console.log('SSL Gateway URL:', sslResponse.GatewayPageURL);
    console.log('SSL Payment Details:', {
      amount: sslResponse.amount || 'Not provided',
      currency: sslResponse.currency || 'Not provided in response',
      requestedCurrency: currency
    });
    
    if (!sslResponse.GatewayPageURL) {
      console.error('SSL Commerz error:', sslResponse)
      return NextResponse.json({ 
        error: 'Invalid response from payment gateway',
        details: sslResponse
      }, { status: 400 })
    }
    
    // Store payment info in the session/cookie
    const cookieStore = cookies()
    
    // Store payment data
    await cookieStore.set('ssl_payment_data', JSON.stringify({
      orderId,
      amount: numericAmount,
      isPartialPayment,
      transactionId,
      currency
    }), { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 3600 // 1 hour
    });
    
    console.log('SSL Commerz payment initialized successfully:', transactionId);
    
    return NextResponse.json({
      status: 'success',
      redirect_url: sslResponse.GatewayPageURL,
      transactionId: transactionId,
      amount: numericAmount,
      orderId: orderId,
      isPartialPayment: isPartialPayment,
      currency: currency
    });
  } catch (error) {
    console.error('SSL Commerz payment initialization error:', error)
    return NextResponse.json({ 
      status: 'error',
      error: 'Failed to initialize payment',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 