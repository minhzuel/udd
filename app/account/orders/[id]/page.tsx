'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft, 
  Package, 
  ShoppingBag, 
  Truck, 
  User,
  MapPin,
  CreditCard,
  Clock,
  CircleCheck,
  CircleDashed,
  Home,
  Download,
  Check,
  AlertTriangle
} from 'lucide-react'

// These interfaces match the database schema exactly
interface ProductDetails {
  product_id: number
  name: string
  main_image: string
}

interface ProductVariation {
  variation_id: number
  variation_name: string
  variation_value: string
}

interface VariationCombination {
  combination_id: number
  image_url: string | null
  price: string | null
  offer_price: string | null
  stock_quantity: number | null
  variation_id_1: number | null
  variation_id_2: number | null
  variation_id_3: number | null
  product_variations_product_variation_combinations_variation_id_1Toproduct_variations: ProductVariation | null
  product_variations_product_variation_combinations_variation_id_2Toproduct_variations: ProductVariation | null
  product_variations_product_variation_combinations_variation_id_3Toproduct_variations: ProductVariation | null
}

interface OrderItem {
  order_item_id: number
  order_id: number | null
  product_id: number | null
  quantity: number | null
  item_price: string | null
  item_cost: string | null
  variation_details: string | null
  variation_combination_id: number | null
  product: ProductDetails | null
  product_variation_combinations: VariationCombination | null
}

interface AddressInfo {
  address_id: number
  full_name: string | null
  mobile_no: string | null
  address: string | null
  city: string | null
  address_type: string | null
  address_title: string | null
  is_default_shipping: boolean | null
  is_default_billing: boolean | null
}

interface PaymentInfo {
  payment_id: number
  payment_method: string
  payment_amount: string | null
  payment_date: string | null
  transaction_id: string | null
}

interface Order {
  order_id: number
  user_id: number | null
  order_date: string | null
  order_status: string | null
  shipping_method: string | null
  shipping_charge: string | null
  subtotal: string | null
  total_amount: string | null
  full_name: string | null
  mobile_no: string | null
  email: string | null
  shipping_address: AddressInfo | null
  billing_address: AddressInfo | null
  payments: PaymentInfo[]
  order_items: OrderItem[]
  order_number?: string | null
}

export default function OrderDetailPage({ params }: { params: any }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use React.use() to safely unwrap the params promise
  // This follows the Next.js recommendation for future compatibility
  const unwrappedParams = React.use(params) as { id: string };
  const orderId = unwrappedParams?.id || '';

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Use fetch with a simple query string instead of URL object construction
        // This ensures the parameter is properly passed to the server
        const response = await fetch(`/api/orders/${orderId}?allowGuest=true`, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            console.error(`Order ${orderId} not found`);
            router.push('/account/orders');
            return;
          }
          throw new Error(`Failed to fetch order: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Original order data:', data);
        
        // Map the camelCase API response to our snake_case interface
        const mappedOrder: Order = {
          order_id: data.order?.id || data.id,
          order_number: data.order?.orderNumber || data.orderNumber,
          user_id: data.order?.userId || data.userId,
          order_date: data.order?.orderDate || data.orderDate,
          order_status: data.order?.orderStatus || data.orderStatus,
          shipping_method: data.order?.shipping_method || data.shipping_method,
          shipping_charge: data.order?.shippingCost?.toString() || data.shippingCost?.toString() || data.order?.shippingCharge?.toString() || data.shippingCharge?.toString(),
          subtotal: data.order?.subTotal?.toString() || data.subTotal?.toString() || data.order?.subtotal?.toString() || data.subtotal?.toString(),
          total_amount: data.order?.totalAmount?.toString() || data.totalAmount?.toString(),
          full_name: data.order?.fullName || data.fullName,
          mobile_no: data.order?.mobileNo || data.mobileNo,
          email: data.order?.email || data.email,
          
          // Map addresses
          shipping_address: data.order?.shippingAddress || data.shippingAddress ? {
            address_id: data.order?.shippingAddress?.id || data.shippingAddress?.id,
            full_name: data.order?.shippingAddress?.fullName || data.shippingAddress?.fullName,
            mobile_no: data.order?.shippingAddress?.mobileNo || data.shippingAddress?.mobileNo,
            address: data.order?.shippingAddress?.address || data.shippingAddress?.address,
            city: data.order?.shippingAddress?.city || data.shippingAddress?.city,
            address_type: data.order?.shippingAddress?.addressType || data.shippingAddress?.addressType,
            address_title: data.order?.shippingAddress?.addressTitle || data.shippingAddress?.addressTitle,
            is_default_shipping: data.order?.shippingAddress?.isDefaultShipping || data.shippingAddress?.isDefaultShipping,
            is_default_billing: data.order?.shippingAddress?.isDefaultBilling || data.shippingAddress?.isDefaultBilling
          } : null,
          
          billing_address: data.order?.billingAddress || data.billingAddress ? {
            address_id: data.order?.billingAddress?.id || data.billingAddress?.id,
            full_name: data.order?.billingAddress?.fullName || data.billingAddress?.fullName,
            mobile_no: data.order?.billingAddress?.mobileNo || data.billingAddress?.mobileNo,
            address: data.order?.billingAddress?.address || data.billingAddress?.address,
            city: data.order?.billingAddress?.city || data.billingAddress?.city,
            address_type: data.order?.billingAddress?.addressType || data.billingAddress?.addressType,
            address_title: data.order?.billingAddress?.addressTitle || data.billingAddress?.addressTitle,
            is_default_shipping: data.order?.billingAddress?.isDefaultShipping || data.billingAddress?.isDefaultShipping,
            is_default_billing: data.order?.billingAddress?.isDefaultBilling || data.billingAddress?.isDefaultBilling
          } : null,
          
          // Map payments
          payments: (data.order?.payments || data.order?.OrderPayment || data.payments || data.OrderPayment || []).map((payment: any) => ({
            payment_id: payment.id || payment.payment_id,
            payment_method: payment.paymentMethod || payment.payment_method,
            payment_amount: payment.paymentAmount?.toString() || payment.payment_amount?.toString(),
            payment_date: payment.paymentDate || payment.payment_date,
            transaction_id: payment.transactionId || payment.transaction_id
          })),
          
          // Map order items
          order_items: (data.order?.orderItems || data.orderItems || []).map((item: any) => {
            console.log('Mapping item:', item);
            return {
              order_item_id: item.id || item.order_item_id,
              order_id: item.orderId || item.order_id,
              product_id: item.productId || item.product_id,
              quantity: item.quantity,
              item_price: item.price?.toString() || item.item_price?.toString(),
              item_cost: item.cost?.toString() || item.item_cost?.toString(),
              variation_details: typeof item.variation === 'string' ? item.variation : item.variationDetails || item.variation_details,
              variation_combination_id: item.variationId || item.variation_combination_id,
              
              // Map product
              product: item.product ? {
                product_id: item.product.id || item.product.product_id,
                name: item.product.name,
                main_image: item.product.mainImage || item.product.main_image
              } : null,
              
              // Map variation combinations
              product_variation_combinations: item.variation && typeof item.variation === 'object' ? {
                combination_id: item.variation.id || item.variation.combination_id,
                image_url: item.variation.image || item.variation.image_url,
                price: item.variation.price?.toString(),
                offer_price: item.variation.offerPrice?.toString() || item.variation.offer_price?.toString(),
                stock_quantity: item.variation.stockQuantity || item.variation.stock_quantity,
                variation_id_1: item.variation.variationId1 || item.variation.variation_id_1,
                variation_id_2: item.variation.variationId2 || item.variation.variation_id_2,
                variation_id_3: item.variation.variationId3 || item.variation.variation_id_3,
                
                // Map variations
                product_variations_product_variation_combinations_variation_id_1Toproduct_variations: 
                  item.variation.variations && item.variation.variations[0] ? {
                    variation_id: item.variation.variations[0].id || item.variation.variations[0].variation_id,
                    variation_name: item.variation.variations[0].name || item.variation.variations[0].variation_name,
                    variation_value: item.variation.variations[0].value || item.variation.variations[0].variation_value
                  } : null,
                
                product_variations_product_variation_combinations_variation_id_2Toproduct_variations: 
                  item.variation.variations && item.variation.variations[1] ? {
                    variation_id: item.variation.variations[1].id || item.variation.variations[1].variation_id,
                    variation_name: item.variation.variations[1].name || item.variation.variations[1].variation_name,
                    variation_value: item.variation.variations[1].value || item.variation.variations[1].variation_value
                  } : null,
                
                product_variations_product_variation_combinations_variation_id_3Toproduct_variations: 
                  item.variation.variations && item.variation.variations[2] ? {
                    variation_id: item.variation.variations[2].id || item.variation.variations[2].variation_id,
                    variation_name: item.variation.variations[2].name || item.variation.variations[2].variation_name,
                    variation_value: item.variation.variations[2].value || item.variation.variations[2].variation_value
                  } : null
              } : null
            };
          })
        };
        
        console.log('Mapped order:', mappedOrder);
        setOrder(mappedOrder);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '$0.00';
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-500';
    
    const statusMap: Record<string, string> = {
      'PENDING': 'bg-amber-500',
      'PROCESSING': 'bg-blue-500',
      'SHIPPED': 'bg-purple-500',
      'DELIVERED': 'bg-green-500',
      'CANCELLED': 'bg-red-500',
    };
    return statusMap[status] || 'bg-gray-500';
  };

  const formatAddress = (address: AddressInfo | null): string => {
    if (!address) return 'No address information available';
    
    const parts = [];
    if (address.full_name) parts.push(address.full_name);
    if (address.address) parts.push(address.address);
    if (address.city) parts.push(address.city);
    
    return parts.join(', ') || 'No address details available';
  };

  const getVariations = (item: OrderItem): { name: string, value: string }[] => {
    const variations: { name: string, value: string }[] = [];
    
    // Check for structured variation combinations from the database
    if (item.product_variation_combinations) {
      const combination = item.product_variation_combinations;
      
      // Variation 1 (always required in the schema)
      if (combination.product_variations_product_variation_combinations_variation_id_1Toproduct_variations) {
        const variation1 = combination.product_variations_product_variation_combinations_variation_id_1Toproduct_variations;
        variations.push({
          name: variation1.variation_name,
          value: variation1.variation_value
        });
      }
      
      // Variation 2 (optional)
      if (combination.product_variations_product_variation_combinations_variation_id_2Toproduct_variations) {
        const variation2 = combination.product_variations_product_variation_combinations_variation_id_2Toproduct_variations;
        variations.push({
          name: variation2.variation_name,
          value: variation2.variation_value
        });
      }
      
      // Variation 3 (optional)
      if (combination.product_variations_product_variation_combinations_variation_id_3Toproduct_variations) {
        const variation3 = combination.product_variations_product_variation_combinations_variation_id_3Toproduct_variations;
        variations.push({
          name: variation3.variation_name,
          value: variation3.variation_value
        });
      }
    }
    
    // If no structured variations found, try the legacy variation_details JSON string
    if (variations.length === 0 && item.variation_details) {
      try {
        const details = JSON.parse(item.variation_details);
        if (details.name && details.value) {
          variations.push({
            name: details.name,
            value: details.value
          });
        }
      } catch (e) {
        // If parsing fails, ignore
      }
    }
    
    return variations;
  };

  const getItemImage = (orderItem: OrderItem): string => {
    // First priority: variation combination image
    if (orderItem.product_variation_combinations?.image_url) {
      return orderItem.product_variation_combinations.image_url;
    }
    
    // Second priority: product main image
    if (orderItem.product?.main_image) {
      return orderItem.product.main_image;
    }
    
    // Third priority: try to extract from legacy variation_details
    if (orderItem.variation_details) {
      try {
        const details = JSON.parse(orderItem.variation_details);
        if (details.image) {
          return details.image;
        }
      } catch (e) {
        // If parsing fails, ignore and use fallback
      }
    }
    
    // Fallback
    return '/images/product-placeholder.png';
  };

  const getOrderSteps = (status: string | null) => {
    const steps = [
      { name: 'Order Placed', status: 'PENDING', icon: Package },
      { name: 'Processing', status: 'PROCESSING', icon: CircleDashed },
      { name: 'Shipped', status: 'SHIPPED', icon: Truck },
      { name: 'Delivered', status: 'DELIVERED', icon: CircleCheck }
    ];
    
    if (!status || status === 'CANCELLED') {
      return steps.map(step => ({
        ...step,
        completed: false,
        active: false
      }));
    }
    
    const currentStepIndex = steps.findIndex(step => step.status === status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index < currentStepIndex,
      active: index === currentStepIndex
    }));
  };

  const calculateItemTotal = (item: OrderItem): string => {
    const quantity = item.quantity || 1;
    const price = item.item_price || '0';
    const total = quantity * parseFloat(price);
    return formatCurrency(total.toString());
  };

  const getCustomerName = (): string => {
    if (order?.shipping_address?.full_name) {
      return order.shipping_address.full_name;
    }
    
    if (order?.full_name) {
      return order.full_name;
    }
    
    return 'Customer';
  };

  const getCustomerContact = (): { mobile?: string, email?: string } => {
    const contact: { mobile?: string, email?: string } = {};
    
    if (order?.shipping_address?.mobile_no) {
      contact.mobile = order.shipping_address.mobile_no;
    } else if (order?.mobile_no) {
      contact.mobile = order.mobile_no;
    }
    
    if (order?.email) {
      contact.email = order.email;
    }
    
    return contact;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
              <Skeleton className="h-64" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Order not found</h3>
        <p className="text-muted-foreground mb-4">
          The order you are looking for does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const customerName = getCustomerName();
  const customerContact = getCustomerContact();
  const orderNumber = order.order_number || `ORD-${(order.order_id || '').toString().padStart(6, '0')}`;

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/account/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <Badge className={`${getStatusColor(order.order_status)} px-3 py-0.5 text-xs font-medium text-white`}>
          {order.order_status}
        </Badge>
      </div>
      
      {/* Header Card */}
      <Card className="border-0 overflow-hidden shadow-lg">
        <CardHeader className="relative pb-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Order #{orderNumber}</CardTitle>
              <CardDescription className="text-white/90 text-sm mt-1">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Placed on {formatDate(order.order_date)}</span>
                </div>
              </CardDescription>
            </div>
            
            {order.order_status === 'DELIVERED' && (
              <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-green-500/20 px-3 py-1.5 rounded-full">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
            
            {order.order_status === 'CANCELLED' && (
              <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-red-500/20 px-3 py-1.5 rounded-full">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Cancelled</span>
              </div>
            )}
          </div>
          
          {/* Order Progress */}
          {order.order_status !== 'CANCELLED' && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10">
              <div 
                className="h-full bg-white" 
                style={{ 
                  width: `${getOrderSteps(order.order_status).filter(step => step.completed || step.active).length / 4 * 100}%` 
                }}
              />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Order Progress Steps */}
          {order.order_status !== 'CANCELLED' && (
            <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="relative flex justify-between">
                {getOrderSteps(order.order_status).map((step, index) => (
                  <div key={step.name} className="relative flex flex-col items-center z-10">
                    <div 
                      className={`flex h-10 w-10 items-center justify-center rounded-full 
                        ${step.completed 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                          : step.active 
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white ring-4 ring-indigo-100' 
                            : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="mt-2 text-xs font-medium text-slate-700">{step.name}</span>
                  </div>
                ))}
                
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" style={{ zIndex: 0 }}>
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500" 
                    style={{ 
                      width: `${getOrderSteps(order.order_status).filter(step => step.completed).length / (getOrderSteps(order.order_status).length - 1) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Customer & Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center mb-3">
                  <User className="h-4 w-4 mr-2 text-violet-500" />
                  Customer Information
                </h3>
                <p className="text-sm font-medium text-slate-900">{customerName}</p>
                {customerContact.mobile && (
                  <p className="text-xs text-slate-500">{customerContact.mobile}</p>
                )}
                {customerContact.email && (
                  <p className="text-xs text-slate-500">{customerContact.email}</p>
                )}
              </div>
              
              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center mb-3">
                    <MapPin className="h-4 w-4 mr-2 text-violet-500" />
                    Shipping Address
                  </h3>
                  <p className="text-sm text-slate-700">{formatAddress(order.shipping_address)}</p>
                </div>
              )}
              
              {/* Billing Address - only show if different from shipping */}
              {order.billing_address && 
               (!order.shipping_address || 
                order.billing_address.address_id !== order.shipping_address.address_id) && (
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center mb-3">
                    <Home className="h-4 w-4 mr-2 text-violet-500" />
                    Billing Address
                  </h3>
                  <p className="text-sm text-slate-700">{formatAddress(order.billing_address)}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Shipping Method */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center mb-3">
                  <Truck className="h-4 w-4 mr-2 text-violet-500" />
                  Shipping Method
                </h3>
                <p className="text-sm text-slate-700 capitalize">{order.shipping_method || 'Standard Shipping'}</p>
              </div>
              
              {/* Payment Information */}
              {order.payments && order.payments.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center mb-3">
                    <CreditCard className="h-4 w-4 mr-2 text-violet-500" />
                    Payment Information
                  </h3>
                  <p className="text-sm font-medium text-slate-900 capitalize">{order.payments[0].payment_method}</p>
                  {order.payments[0].transaction_id && (
                    <p className="text-xs text-slate-500">
                      Transaction ID: {order.payments[0].transaction_id}
                    </p>
                  )}
                  {order.payments[0].payment_date && (
                    <p className="text-xs text-slate-500">
                      Paid on {formatDate(order.payments[0].payment_date)}
                    </p>
                  )}
                </div>
              )}
              
              {/* Order Summary */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="text-slate-900">{formatCurrency(order.shipping_charge)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-900">Total</span>
                    <span className="text-violet-600">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="px-6 pb-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Order Items</h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Variations</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items?.map((item) => {
                    const itemImage = getItemImage(item);
                    const variations = getVariations(item);
                    const itemPrice = item.item_price ? formatCurrency(item.item_price) : '$0.00';
                    const itemTotal = calculateItemTotal(item);
                    
                    return (
                      <TableRow key={item.order_item_id}>
                        <TableCell className="align-middle">
                          <div className="h-16 w-16 rounded-md border border-slate-200 overflow-hidden">
                            {itemImage ? (
                              <img 
                                src={itemImage} 
                                alt={item.product?.name || 'Product'} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.product?.name || 'Unknown Product'}
                        </TableCell>
                        <TableCell>
                          {variations.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {variations.map((variation, idx) => (
                                <Badge 
                                  key={idx} 
                                  className="bg-violet-50 text-violet-700 hover:bg-violet-50 border-violet-200"
                                >
                                  {variation.name}: {variation.value}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-sm">No variations</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{itemPrice}</TableCell>
                        <TableCell className="text-center">{item.quantity || 1}</TableCell>
                        <TableCell className="text-right font-medium">{itemTotal}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between p-6 bg-slate-50 border-t">
          <Button variant="outline" className="text-slate-700 border-slate-300" asChild>
            <Link href="/account/orders">
              Return to Orders
            </Link>
          </Button>
          
          {order.order_status === 'DELIVERED' && (
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 