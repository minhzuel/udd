'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Search, 
  Calendar, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package2,
  ShoppingBag
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

// Define consistent order status values - this ensures UI is uniform
const orderStatuses = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get item image
  const getItemImage = (orderItem) => {
    // First try to get the variation combination image
    if (orderItem?.product_variation_combinations?.image_url) {
      return orderItem.product_variation_combinations.image_url;
    }
    
    // Then try to get the product image
    if (orderItem?.product?.main_image) {
      return orderItem.product.main_image;
    }

    // Try using mainImage as an alternative field name
    if (orderItem?.product?.mainImage) {
      return orderItem.product.mainImage;
    }
    
    // Fallback - no image available
    return '';
  };

  // Fetch orders with error handling
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Build query params for filtering by status
        let url = '/api/user/orders';
        if (statusFilter && statusFilter !== 'ALL') {
          url += `?status=${statusFilter}`;
        }
        
        console.log('Fetching orders from:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        
        // Validate the response structure
        if (!data || !data.orders || !Array.isArray(data.orders)) {
          console.error('Unexpected API response format:', data);
          throw new Error('Invalid response format from server');
        }
        
        console.log(`Successfully loaded ${data.orders.length} orders`);
        
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load orders');
        setLoading(false);
        setOrders([]);
        setFilteredOrders([]);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  // Filter orders
  useEffect(() => {
    try {
      let result = [...orders];

      // Apply date range filter
      if (dateRange.from) {
        result = result.filter(order => {
          if (!order.orderDate) return false;
          const orderDate = new Date(order.orderDate);
          return orderDate >= dateRange.from;
        });
      }
      
      if (dateRange.to) {
        result = result.filter(order => {
          if (!order.orderDate) return false;
          const orderDate = new Date(order.orderDate);
          return orderDate <= dateRange.to;
        });
      }

      // Apply preset date filter
      if (dateFilter) {
        const now = new Date();
        let startDate;
        
        if (dateFilter === 'today') {
          startDate = new Date(now.setHours(0, 0, 0, 0));
        } else if (dateFilter === '7days') {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
        } else if (dateFilter === '1month') {
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
        }
        
        if (startDate) {
          result = result.filter(order => {
            if (!order.orderDate) return false;
            const orderDate = new Date(order.orderDate);
            return orderDate >= startDate;
          });
        }
      }

      // Apply search filter
      if (searchTerm) {
        result = result.filter(order => {
          // Check ID and order number
          if (order.id && order.id.toString().includes(searchTerm)) return true;
          if (order.orderNumber && order.orderNumber.includes(searchTerm)) return true;
          
          // Check full name
          if (order.fullName && order.fullName.toLowerCase().includes(searchTerm.toLowerCase())) return true;
          
          return false;
        });
      }

      setFilteredOrders(result);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error('Error filtering orders:', error);
      setFilteredOrders(orders); // Fall back to unfiltered orders
    }
  }, [orders, searchTerm, dateFilter, dateRange]);

  const getStatusColor = (status) => {
    if (!status) return '';
    
    // Normalize status to uppercase for consistent comparison
    const normalizedStatus = status.toUpperCase();
    
    const statusMap = {
      'PENDING': 'bg-yellow-500',
      'PROCESSING': 'bg-blue-500',
      'SHIPPED': 'bg-purple-500',
      'DELIVERED': 'bg-green-500',
      'CANCELLED': 'bg-red-500',
    };
    return statusMap[normalizedStatus] || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(parseFloat(amount));
    } catch (error) {
      return '$0.00';
    }
  };

  // Calculate pagination
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDateFilter('');
    setDateRange({ from: undefined, to: undefined });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>View and track your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <Skeleton className="h-10 w-64" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          <div className="border rounded-md">
            <div className="relative w-full overflow-auto">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-1">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>View and track your order history</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter and Search Controls */}
        <div className="mb-4 flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2 w-full md:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Combined date filter with presets and calendar */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !dateRange.from && !dateFilter && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateFilter === 'today' && "Today"}
                  {dateFilter === '7days' && "Last 7 days"}
                  {dateFilter === '1month' && "Last month"}
                  {dateRange.from && !dateFilter ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    !dateFilter && "Date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-2 border-b">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Presets</h4>
                    <div className="flex gap-2">
                      <Button 
                        variant={dateFilter === 'today' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => {
                          setDateFilter('today');
                          setDateRange({ from: undefined, to: undefined });
                        }}
                      >
                        Today
                      </Button>
                      <Button 
                        variant={dateFilter === '7days' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => {
                          setDateFilter('7days');
                          setDateRange({ from: undefined, to: undefined });
                        }}
                      >
                        7 days
                      </Button>
                      <Button 
                        variant={dateFilter === '1month' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => {
                          setDateFilter('1month');
                          setDateRange({ from: undefined, to: undefined });
                        }}
                      >
                        1 month
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="border-b p-2">
                  <h4 className="text-sm font-medium mb-1">Custom range</h4>
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range || { from: undefined, to: undefined });
                      if (range?.from) setDateFilter(''); // Clear preset filter when custom range is selected
                    }}
                    numberOfMonths={2}
                  />
                </div>
                {(dateRange.from || dateRange.to || dateFilter) && (
                  <div className="flex items-center justify-end p-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setDateRange({ from: undefined, to: undefined });
                        setDateFilter('');
                      }}
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            {(statusFilter !== 'ALL' || searchTerm || dateFilter || dateRange.from || dateRange.to) && (
              <Button variant="ghost" onClick={clearFilters} className="h-10">
                Clear All
              </Button>
            )}
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">No orders found</h3>
            <p className="text-muted-foreground">
              {orders.length > 0 
                ? "Try adjusting your filters" 
                : "You haven't placed any orders yet"}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.map((order) => (
                  <TableRow key={order.id} className="h-16">
                    <TableCell className="font-medium py-2">
                      {order.orderNumber || `#${order.id}`}
                    </TableCell>
                    <TableCell className="py-2">{formatDate(order.orderDate)}</TableCell>
                    <TableCell className="py-2">
                      <div className="flex overflow-hidden">
                        {order.orderItems && order.orderItems.length > 0 ? (
                          <div className="flex -space-x-3">
                            {order.orderItems.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="relative" style={{ zIndex: 10 - idx }}>
                                {getItemImage(item) ? (
                                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted border-2 border-background">
                                    <Image
                                      src={getItemImage(item)}
                                      alt={item.product?.name || 'Product'}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                                    <Package2 className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.orderItems.length > 3 && (
                              <div className="relative z-0 w-9 h-9 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                                <span className="text-xs font-medium">+{order.orderItems.length - 3}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No items</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold py-2">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={`${getStatusColor(order.orderStatus)} py-0 px-2 text-xs`}>
                        {order.orderStatus || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => router.push(`/account/orders/${order.id}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination */}
        {filteredOrders.length > itemsPerPage && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 