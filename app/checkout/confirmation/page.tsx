'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Package, Truck, CreditCard, Calendar, MapPin, User, CheckCircle2, Lock, Copy, Check, ShoppingBag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { useCurrency } from '@/app/contexts/CurrencyContext'

// Custom helper for getting numeric prices
const getNumericPrice = (price: string | number | null | undefined): number => {
  if (price === null || price === undefined) {
    return 0;
  }
  try {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numericPrice) ? 0 : numericPrice;
  } catch (error) {
    console.error('Error parsing price:', error);
    return 0;
  }
};

interface ProductVariation {
  name?: string;
  value?: string;
}

interface VariationCombination {
  id: number;
  imageUrl?: string;
  price: number;
  variation1?: ProductVariation;
  variation2?: ProductVariation;
  variation3?: ProductVariation;
}

interface OrderItem {
  id: number
  quantity: number
  price: number | string
  variation?: {
    id: number
    value: string
    image: string
    price: number
    variations: Array<{
      id: number
      name: string
      value: string
    }>
  }
  product: {
    id: number
    name: string
    mainImage: string
  }
}

interface Order {
  id: number
  guest_id: number
  fullName: string
  mobileNo: string
  email: string
  address: string
  shipping_method: string
  shippingCharge: string | number
  order_status: string
  subtotal: string | number
  couponAmount?: string | number | null
  discountAmount?: string | number | null
  adjustmentAmount?: string | number | null
  total_amount: string | number
  orderDate: string
  orderItems: OrderItem[]
  userId: number | null
  rewardPointsDiscount: string | number
  rewardPointsUsed: number
  payments?: {
    id: number
    paymentMethod: string
    paymentAmount: string | number
    paymentDate: string
    transactionId?: string | null
  }[]
  shippingAddress?: {
    id: number
    fullName: string
    mobileNo: string
    address: string
    city: string
  }
  billingAddress?: {
    id: number
    fullName: string
    mobileNo: string
    address: string
    city: string
  }
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full')
  const [partialAmount, setPartialAmount] = useState<string>('')
  const [partialAmountError, setPartialAmountError] = useState<string>('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card')
  const [copied, setCopied] = useState(false)
  const { formatPrice, currency } = useCurrency();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return

      try {
        const response = await fetch(`/api/orders/${orderId}?allowGuest=true`)
        if (!response.ok) {
          throw new Error('Failed to fetch order details')
        }
        const data = await response.json()
        console.log('Order data received:', data)
        
        // Handle both direct order and nested order property
        const orderData = data.order || data
        
        if (!orderData) {
          throw new Error('No order data returned from API')
        }
        
        console.log('Shipping charge sources:', {
          shippingCharge: orderData.shippingCharge,
          shippingCost: orderData.shippingCost,
          shipping_charge: orderData.shipping_charge
        })
        
        // Normalize field names for consistency
        const normalizedOrder = {
          ...orderData,
          id: orderData.id,
          orderNumber: orderData.orderNumber || `ORD-${orderData.id.toString().padStart(6, '0')}`,
          // Handle field name differences
          subtotal: orderData.subtotal || orderData.subTotal || '0',
          shippingCharge: orderData.shippingCost || orderData.shippingCharge || orderData.shipping_charge || '0',
          shipping_method: orderData.shippingMethod || orderData.shipping_method || 'Standard Shipping',
          payments: orderData.payments || orderData.OrderPayment || [],
          order_status: orderData.order_status || orderData.orderStatus || 'PENDING',
          total_amount: orderData.total_amount || orderData.totalAmount || '0',
          orderDate: orderData.orderDate,
          orderItems: Array.isArray(orderData.orderItems) ? orderData.orderItems : []
        }
        
        console.log('Normalized order data:', normalizedOrder)
        console.log('Shipping charge data:', {
          original: {
            shippingCost: orderData.shippingCost,
            shippingCharge: orderData.shippingCharge,
            shipping_charge: orderData.shipping_charge
          },
          normalized: normalizedOrder.shippingCharge,
          display: formatPrice(normalizedOrder.shippingCharge)
        })
        setOrder(normalizedOrder)
        
        // Set default payment method and partial amount
        if (normalizedOrder) {
          const totalAmount = typeof normalizedOrder.total_amount === 'string' 
            ? parseFloat(normalizedOrder.total_amount) 
            : (normalizedOrder.total_amount || 0)
          const minAmount = totalAmount * 0.1
          setPartialAmount(minAmount.toFixed(2))
          
          if (normalizedOrder.payments && normalizedOrder.payments.length > 0) {
            setSelectedPaymentMethod(normalizedOrder.payments[0].paymentMethod)
          }
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError(err instanceof Error ? err.message : 'Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const validatePartialAmount = (amount: string) => {
    if (!order) return false
    
    // Remove any currency symbols and trim whitespace
    const sanitizedAmount = amount.replace(/[$£€]/g, '').trim();
    const numAmount = parseFloat(sanitizedAmount)
    const totalAmount = typeof order.total_amount === 'string' 
      ? parseFloat(order.total_amount) 
      : order.total_amount
    const minAmount = totalAmount * 0.1 // 10% of total amount
    
    if (isNaN(numAmount) || numAmount < minAmount) {
      setPartialAmountError(`Minimum payment amount is $${minAmount.toFixed(2)}`)
      return false
    }
    
    if (numAmount > totalAmount) {
      setPartialAmountError(`Payment amount cannot exceed $${totalAmount.toFixed(2)}`)
      return false
    }
    
    setPartialAmountError('')
    return true
  }

  const handlePartialAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPartialAmount(value)
    validatePartialAmount(value)
  }

  const handlePayment = async () => {
    if (!order) return

    if (paymentType === 'partial') {
      if (!validatePartialAmount(partialAmount)) {
        return
      }
    }

    // Add currency conversion logic here
    // If we're showing prices in BDT but the payment backend expects USD
    const isUsingBDT = currency.code === 'BDT';
    const exchangeRate = isUsingBDT ? (1 / currency.exchangeRate) : 1;
    console.log(`Using currency: ${currency.code}, Exchange rate: ${exchangeRate}`);

    // Get order total as number
    let totalAmountValue;
    
    // If total_amount is undefined or NaN, calculate it from components
    if (order.total_amount === undefined || isNaN(parseFloat(String(order.total_amount)))) {
      // Calculate total from individual components
      const subtotal = getNumericPrice(order.subtotal);
      const shipping = getNumericPrice(order.shippingCharge || order.shippingCost || order.shipping_charge || 0);
      const coupon = order.couponAmount ? getNumericPrice(order.couponAmount) : 0;
      const discount = order.discountAmount ? getNumericPrice(order.discountAmount) : 0;
      const rewardPoints = order.rewardPointsDiscount ? getNumericPrice(order.rewardPointsDiscount) : 0;
      
      totalAmountValue = subtotal + shipping - coupon - discount - rewardPoints;
      console.log('Calculated total amount from components:', totalAmountValue);
    } else {
      totalAmountValue = typeof order.total_amount === 'string' 
        ? parseFloat(order.total_amount) 
        : order.total_amount;
    }
    
    console.log('Order total amount:', order.total_amount, 'Type:', typeof order.total_amount, 'Parsed value:', totalAmountValue);
    
    // Calculate remaining amount to pay - for full payment option
    // Calculate already paid amount
    const alreadyPaid = order.payments && order.payments.length > 0
      ? order.payments.reduce((sum, payment) => {
          return sum + getNumericPrice(payment.paymentAmount);
        }, 0)
      : 0;
    
    // Calculate remaining amount
    const remainingAmount = Math.max(0, totalAmountValue - alreadyPaid);
    console.log('Remaining amount to pay:', remainingAmount);
    
    // If bKash is selected, initialize bKash payment
    if (selectedPaymentMethod === 'bkash') {
      setIsProcessingPayment(true)
      try {
        // Get order total as number
        let paymentAmount;
        
        if (paymentType === 'partial') {
          // For partial payment, get the value from the input field
          // Remove any currency symbols from partial amount and parse as float
          const sanitizedAmount = partialAmount.replace(/[$£€৳]/g, '').trim();
          paymentAmount = parseFloat(sanitizedAmount);
        } else {
          // For full payment, use the remaining amount
          paymentAmount = remainingAmount;
        }
        
        console.log(`Before conversion - Payment amount: ${paymentAmount}, Currency: ${currency.code}`);
        
        // For bKash, we need to send BDT amount (bKash only works with BDT)
        let finalAmount;
        let paymentCurrency = 'BDT'; // bKash only accepts BDT
        
        if (isUsingBDT) {
          // If already in BDT, use the amount as is
          finalAmount = paymentAmount;
          console.log(`Using original BDT amount for bKash: ${finalAmount} BDT`);
        } else {
          // If in USD, convert to BDT for bKash
          finalAmount = paymentAmount / exchangeRate; // Convert USD to BDT
          console.log(`Converting payment from USD to BDT for bKash: ${paymentAmount} USD = ${finalAmount} BDT`);
        }
          
        // Verify amount is not undefined or NaN
        if (isNaN(finalAmount) || finalAmount <= 0) {
          console.error('Invalid payment amount:', finalAmount);
          throw new Error('Invalid payment amount. Please try again.');
        }
        
        console.log('Initializing bKash payment with amount:', finalAmount, paymentCurrency);
        
        // Initialize bKash payment via API
        const response = await fetch('/api/payments/bkash/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            amount: finalAmount,
            isPartialPayment: paymentType === 'partial',
            currency: paymentCurrency,
            displayCurrency: currency.code // Send the user's display currency for reference
          }),
        });

        const responseData = await response.json();
        console.log('bKash initialization response:', responseData);
        
        if (response.ok && responseData.status === 'success') {
          // Redirect to bKash payment page
          window.location.href = `/checkout/payment/bkash?paymentID=${responseData.paymentID}&amount=${responseData.amount}&orderId=${order.id}`;
        } else {
          const errorMessage = responseData.error || 'bKash payment initialization failed';
          console.error('bKash payment error:', responseData);
          throw new Error(errorMessage);
        }
        
        return;
      } catch (error) {
        console.error('bKash payment error:', error);
        toast.error(error instanceof Error ? error.message : 'bKash payment initialization failed. Please try again.');
        setIsProcessingPayment(false);
        return;
      }
    }
    
    // If card payment (SSL Commerz) is selected
    if (selectedPaymentMethod === 'card') {
      setIsProcessingPayment(true)
      try {
        // Get order total as number
        let paymentAmount;
        
        if (paymentType === 'partial') {
          // For partial payment, get the value from the input field
          // Remove any currency symbols from partial amount and parse as float
          const sanitizedAmount = partialAmount.replace(/[$£€৳]/g, '').trim();
          paymentAmount = parseFloat(sanitizedAmount);
        } else {
          // For full payment, use the remaining amount
          paymentAmount = remainingAmount;
        }
        
        console.log(`Before conversion - Payment amount: ${paymentAmount}, Currency: ${currency.code}`);
        
        // For SSL Commerz, we always need to send BDT (payment gateway requires BDT)
        let finalAmount;
        let paymentCurrency = 'BDT'; // SSL Commerz only accepts BDT
        
        if (isUsingBDT) {
          // If already in BDT, use the amount as is
          finalAmount = paymentAmount;
          console.log(`Using original BDT amount for SSL Commerz: ${finalAmount} BDT`);
        } else {
          // If in USD, convert to BDT for SSL Commerz
          finalAmount = paymentAmount / exchangeRate; // Convert USD to BDT
          console.log(`Converting payment from USD to BDT for SSL Commerz: ${paymentAmount} USD = ${finalAmount} BDT`);
        }
          
        // Verify amount is not undefined or NaN
        if (isNaN(finalAmount) || finalAmount <= 0) {
          console.error('Invalid payment amount:', finalAmount);
          throw new Error('Invalid payment amount. Please try again.');
        }
        
        console.log('Initializing SSL Commerz payment with amount:', finalAmount, paymentCurrency);
        
        // Initialize SSL Commerz payment via API
        const response = await fetch('/api/payments/sslcommerz/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            amount: finalAmount,
            isPartialPayment: paymentType === 'partial',
            currency: paymentCurrency,
            displayCurrency: currency.code // Send the user's display currency for reference
          }),
        });

        const responseData = await response.json();
        console.log('SSL Commerz initialization response:', responseData);
        
        if (response.ok && responseData.status === 'success') {
          // Redirect to SSL Commerz payment gateway
          window.location.href = responseData.redirect_url;
        } else {
          const errorMessage = responseData.error || 'Payment initialization failed';
          console.error('SSL Commerz payment error:', responseData);
          throw new Error(errorMessage);
        }
        
        return;
      } catch (error) {
        console.error('SSL Commerz payment error:', error);
        toast.error(error instanceof Error ? error.message : 'Payment initialization failed. Please try again.');
        setIsProcessingPayment(false);
        return;
      }
    }

    setIsProcessingPayment(true)
    try {
      // Get the payment amount based on partial or full payment
      let paymentAmount;
      
      if (paymentType === 'partial') {
        // For partial payment, get the value from input
        const sanitizedAmount = partialAmount.replace(/[$£€৳]/g, '').trim();
        paymentAmount = parseFloat(sanitizedAmount);
      } else {
        // For full payment, use the remaining amount
        paymentAmount = remainingAmount;
      }
      
      console.log(`Before conversion - Payment amount: ${paymentAmount}, Currency: ${currency.code}`);
      
      // Determine final payment amount and currency
      let finalAmount;
      let paymentCurrency;
      
      if (isUsingBDT) {
        // For BDT payments, convert to USD for backend processing
        finalAmount = paymentAmount * exchangeRate; // Convert BDT to USD
        paymentCurrency = 'USD';
        console.log(`Converting payment from BDT to USD: ${paymentAmount} BDT = ${finalAmount} USD`);
      } else {
        // If already in USD, use as is
        finalAmount = paymentAmount;
        paymentCurrency = 'USD';
        console.log(`Using original USD amount: ${finalAmount} USD`);
      }
      
      // Verify valid amount
      if (isNaN(finalAmount) || finalAmount <= 0) {
        console.error('Invalid payment amount:', finalAmount);
        throw new Error('Invalid payment amount');
      }
      
      console.log('Sending payment to API with amount:', finalAmount, paymentCurrency);
      
      const response = await fetch(`/api/orders/${order.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: selectedPaymentMethod,
          amount: finalAmount,
          isPartialPayment: paymentType === 'partial',
          currency: paymentCurrency,
          originalCurrency: currency.code
        }),
      })

      if (!response.ok) {
        throw new Error('Payment processing failed')
      }

      toast.success('Payment processed successfully!')
      // Refresh order details
      const updatedOrder = await fetch(`/api/orders/${order.id}`).then(res => res.json())
      setOrder(updatedOrder.order)
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment processing failed. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const copyOrderId = async () => {
    try {
      // Use just the order ID
      const orderNumber = `${order?.id}`;
      await navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Order ID copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy order ID')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Order</h2>
              <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return 'Invalid date'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'card':
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case 'bkash':
        return <div className="h-4 w-4 flex items-center justify-center text-pink-500 font-bold text-[10px]">b</div>
      case 'cash':
      case 'cod':
        return <Package className="h-4 w-4 text-gray-500" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'partial_paid':
        return 'bg-orange-100 text-orange-800'
      case 'paid':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const orderNumber = order.orderNumber || `ORD-${order.id.toString().padStart(6, '0')}`

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      {/* Success Message & Order ID */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 bg-green-50 text-green-800 px-4 py-3 rounded-lg">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <div>
            <h1 className="text-lg font-bold">Order Confirmed</h1>
            <p className="text-sm">Thank you for your purchase</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
          <div className="text-sm flex items-center gap-2">
            <span className="text-gray-500">Order ID:</span>
            <span className="font-medium">{order.id}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={copyOrderId}
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Left Column: Order Info & Items */}
        <div className="md:col-span-3 space-y-4">
          {/* Order Status */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(order.order_status)}`}>
                  {order.order_status?.charAt(0).toUpperCase() + order.order_status?.slice(1) || 'Pending'}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-500">Placed:</span>
                  <span className="font-medium">{new Date(order.orderDate).toLocaleDateString()} {new Date(order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              <div className="flex items-center text-xs gap-2">
                <Truck className="h-3 w-3 text-gray-500" />
                <span className="text-gray-500">{order.shipping_method || 'Standard Shipping'}</span>
              </div>
            </div>
            
            {/* Order Items */}
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <ShoppingBag className="h-4 w-4 mr-2 text-gray-500" />
                Order Items ({order.orderItems.length})
              </h3>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-md flex-shrink-0">
                      <Image
                        src={item.variation?.image || item.product.mainImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">{item.product.name}</h3>
                          {item.variation?.variations && item.variation.variations.length > 0 && (
                            <div className="mt-1 text-sm text-gray-500">
                              {item.variation.variations.map((v, index) => (
                                <span key={v.id}>
                                  {v.name}: {v.value}
                                  {index < item.variation!.variations.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(getNumericPrice(item.price))}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Customer & Shipping Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    Customer Details
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{order.fullName}</p>
                    <p className="text-gray-500 text-xs">{order.email}</p>
                    <p className="text-gray-500 text-xs">{order.mobileNo}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    Delivery Address
                  </h3>
                  <div className="text-sm text-gray-500">
                    {order.shippingAddress ? (
                      <>
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}</p>
                      </>
                    ) : (
                      <p>{order.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: Payment & Summary */}
        <div className="md:col-span-2 space-y-4">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-0 pt-4 px-4">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatPrice(getNumericPrice(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span>{formatPrice(getNumericPrice(order.shippingCharge || order.shippingCost || order.shipping_charge || 0))}</span>
                  </div>
                  {order.couponAmount && getNumericPrice(order.couponAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Coupon Discount</span>
                      <span className="text-green-600">-{formatPrice(getNumericPrice(order.couponAmount))}</span>
                    </div>
                  )}
                  {order.discountAmount && getNumericPrice(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-green-600">-{formatPrice(getNumericPrice(order.discountAmount))}</span>
                    </div>
                  )}
                  {order.rewardPointsDiscount && getNumericPrice(order.rewardPointsDiscount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Reward Points</span>
                      <span className="text-green-600">-{formatPrice(getNumericPrice(order.rewardPointsDiscount))}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-primary">{(() => {
                      // Calculate total from individual components
                      const subtotal = getNumericPrice(order.subtotal);
                      const shipping = getNumericPrice(order.shippingCharge || order.shippingCost || order.shipping_charge || 0);
                      const coupon = order.couponAmount ? getNumericPrice(order.couponAmount) : 0;
                      const discount = order.discountAmount ? getNumericPrice(order.discountAmount) : 0;
                      const rewardPoints = order.rewardPointsDiscount ? getNumericPrice(order.rewardPointsDiscount) : 0;
                      
                      // Return calculated total
                      return formatPrice(subtotal + shipping - coupon - discount - rewardPoints);
                    })()}</span>
                  </div>
                </div>
                
                {order.payments && order.payments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">Payment History</h4>
                    <div className="space-y-2">
                      {order.payments.map(payment => (
                        <div key={payment.id} className="flex justify-between text-sm items-center">
                          <div className="flex items-center gap-1.5">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span className="text-xs text-gray-500">
                              {payment.paymentMethod.toUpperCase()} • {new Date(payment.paymentDate).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="font-medium">{formatPrice(getNumericPrice(payment.paymentAmount))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Section */}
          {/* Show payment section if order is pending or has no payments */}
          {(
            order.order_status?.toLowerCase() === 'pending' || 
            order.order_status === 'PENDING' || 
            !order.payments || 
            order.payments.length === 0
          ) && (
            <Card>
              <CardHeader className="pb-0 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Payment</CardTitle>
                  <div className="flex items-center text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    <Lock className="h-3 w-3 mr-1" />
                    <span>Secure</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {/* Calculate remaining amount to pay */}
                {(() => {
                  // Calculate total order amount
                  const subtotal = getNumericPrice(order.subtotal);
                  const shipping = getNumericPrice(order.shippingCharge || order.shippingCost || order.shipping_charge || 0);
                  const coupon = order.couponAmount ? getNumericPrice(order.couponAmount) : 0;
                  const discount = order.discountAmount ? getNumericPrice(order.discountAmount) : 0;
                  const rewardPoints = order.rewardPointsDiscount ? getNumericPrice(order.rewardPointsDiscount) : 0;
                  
                  const totalOrderAmount = subtotal + shipping - coupon - discount - rewardPoints;
                  
                  // Calculate already paid amount
                  const alreadyPaid = order.payments && order.payments.length > 0
                    ? order.payments.reduce((sum, payment) => {
                        return sum + getNumericPrice(payment.paymentAmount);
                      }, 0)
                    : 0;
                  
                  // Calculate remaining amount
                  const remainingAmount = Math.max(0, totalOrderAmount - alreadyPaid);
                  
                  // Set partial amount default to 10% of remaining
                  if (remainingAmount > 0 && (!partialAmount || getNumericPrice(partialAmount) === 0)) {
                    const minAmount = Math.max(remainingAmount * 0.1, 1);
                    setPartialAmount(minAmount.toFixed(2));
                  }
                  
                  if (remainingAmount <= 0) {
                    return (
                      <div className="bg-green-50 text-green-800 p-3 rounded-md text-sm flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        <span>Payment complete! Your order has been fully paid.</span>
                      </div>
                    );
                  }
                  
                  return (
                    <>
                      <div className="flex justify-between text-sm font-medium bg-gray-50 p-2 rounded-md">
                        <span>Total to Pay:</span>
                        <span className="text-primary">{formatPrice(remainingAmount)}</span>
                      </div>
                      
                      {/* Payment Method Selection */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">Payment Method</Label>
                        <RadioGroup
                          value={selectedPaymentMethod}
                          onValueChange={setSelectedPaymentMethod}
                          className="grid grid-cols-2 gap-2"
                        >
                          <div className={`flex items-center border rounded-md p-2 cursor-pointer text-xs ${
                            selectedPaymentMethod === 'card' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                          }`}>
                            <RadioGroupItem value="card" id="card" className="mr-2" />
                            <Label htmlFor="card" className="flex items-center cursor-pointer">
                              <CreditCard className="h-3 w-3 mr-1" />
                              <span>Online Payment</span>
                            </Label>
                          </div>
                          <div className={`flex items-center border rounded-md p-2 cursor-pointer text-xs ${
                            selectedPaymentMethod === 'bkash' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                          }`}>
                            <RadioGroupItem value="bkash" id="bkash" className="mr-2" />
                            <Label htmlFor="bkash" className="flex items-center cursor-pointer">
                              <div className="h-3 w-3 flex items-center justify-center text-pink-500 font-bold text-[10px]">b</div>
                              <span>bKash</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Payment Amount Options */}
                      {remainingAmount > 0 && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Payment Amount</Label>
                          <RadioGroup
                            value={paymentType}
                            onValueChange={(value: 'full' | 'partial') => {
                              setPaymentType(value);
                              // Auto-set minimum amount (10%) when partial is selected
                              if (value === 'partial') {
                                const minAmount = Math.max(remainingAmount * 0.1, 1);
                                setPartialAmount(minAmount.toFixed(2));
                              }
                            }}
                            className="grid grid-cols-2 gap-2"
                          >
                            <div className={`flex items-center border rounded-md p-2 cursor-pointer text-xs ${
                              paymentType === 'full' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                            }`}>
                              <RadioGroupItem value="full" id="full" className="mr-2" />
                              <Label htmlFor="full" className="cursor-pointer">Full Payment</Label>
                            </div>
                            <div className={`flex items-center border rounded-md p-2 cursor-pointer text-xs ${
                              paymentType === 'partial' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                            }`}>
                              <RadioGroupItem value="partial" id="partial" className="mr-2" />
                              <Label htmlFor="partial" className="cursor-pointer">Partial</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      {/* Partial Payment Input */}
                      {paymentType === 'partial' && remainingAmount > 0 && (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <Label htmlFor="partialAmount" className="text-xs">Payment Amount</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{currency.symbol}</span>
                              <Input
                                id="partialAmount"
                                type="number"
                                min={remainingAmount * 0.1}
                                max={remainingAmount}
                                step="0.01"
                                value={partialAmount}
                                onChange={handlePartialAmountChange}
                                className="pl-6 h-8 text-sm"
                              />
                            </div>
                            {partialAmountError && (
                              <p className="text-xs text-red-500">{partialAmountError}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <div className="space-y-0.5">
                              <p className="text-xs text-gray-500">
                                Min: {formatPrice(remainingAmount * 0.1)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Max: {formatPrice(remainingAmount)}
                              </p>
                            </div>
                            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              Remaining: {formatPrice((remainingAmount - (getNumericPrice(partialAmount) || 0)))}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handlePayment}
                        disabled={isProcessingPayment || (paymentType === 'partial' && !partialAmount)}
                        className="w-full mt-2" 
                        size="sm"
                      >
                        {isProcessingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          `Pay ${paymentType === 'partial' 
                            ? formatPrice(getNumericPrice(partialAmount)) 
                            : formatPrice(remainingAmount)}`
                        )}
                      </Button>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}
          
          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button variant="outline" className="w-full text-sm h-9" size="sm">
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/orders">
              <Button className="w-full text-sm h-9" size="sm">
                <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                View All Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 