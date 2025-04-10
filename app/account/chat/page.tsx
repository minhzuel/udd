'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, MessagesSquare, PlusCircle, Clock, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { fetchConversations, createConversation, fetchUserOrders, type Conversation, type Order, type Product } from '@/app/services'

// Additional types for orders with items
interface OrderItem {
  id: number
  productId: number
  quantity: number
  price: number
  product: {
    id: number
    name: string
    mainImage: string | null
  }
}

interface UserOrder extends Order {
  items: OrderItem[]
}

export default function ChatSupportPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [newChatTitle, setNewChatTitle] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  
  // Additional state for filtered view
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'awaiting_reply' | 'closed'>('all')
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)
  
  // State for user orders
  const [userOrders, setUserOrders] = useState<UserOrder[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])
  
  useEffect(() => {
    // Only fetch orders when the new chat dialog is opened
    if (isNewChatOpen) {
      loadUserOrders()
    }
  }, [isNewChatOpen])
  
  // Set default chat title based on selected order
  useEffect(() => {
    if (selectedOrder && newChatTitle === '') {
      const order = userOrders.find(o => o.id === selectedOrder)
      if (order) {
        setNewChatTitle(`Order #${order.orderNumber} Support`)
      }
    }
  }, [selectedOrder, newChatTitle, userOrders])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await fetchConversations()
      
      setConversations(data)
      
      // Extract unique orders for filters
      const uniqueOrders: Order[] = []
      const orderIds = new Set()
      
      data.forEach((conv: Conversation) => {
        if (conv.order && !orderIds.has(conv.order.id)) {
          orderIds.add(conv.order.id)
          uniqueOrders.push(conv.order)
        }
      })
      
      setOrders(uniqueOrders)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error fetching conversations:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadUserOrders = async () => {
    try {
      setIsLoadingOrders(true)
      
      // Use the service to fetch orders
      const ordersData = await fetchUserOrders()
      
      // Adapt orders for the UI by adding items array if needed
      const adaptedOrders = ordersData.map(order => ({
        ...order,
        items: [] // Empty items array since we don't have them in this context
      }))
      
      setUserOrders(adaptedOrders)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load orders'
      console.error('Error fetching user orders:', error)
      toast.warning(`${errorMessage}. You can still create a chat without attaching an order.`)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const handleCreateConversation = async () => {
    // Validate input
    if (!newChatTitle.trim()) {
      toast.error('Please enter a title for the conversation')
      return
    }
    
    try {
      setIsCreatingChat(true)
      
      const newConversation = await createConversation(
        newChatTitle.trim(),
        undefined, // No product ID for now
        selectedOrder || undefined
      )
      
      if (newConversation) {
        // Chat created successfully
        toast.success('New conversation created')
        
        // Reset form
        setNewChatTitle('')
        setSelectedOrder(null)
        setIsNewChatOpen(false)
        
        // Redirect to new conversation
        router.push(`/account/chat/${newConversation.id}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation'
      console.error('Error creating conversation:', error)
      toast.error(errorMessage)
    } finally {
      setIsCreatingChat(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  const getOrderStatusBadge = (status: string) => {
    // Default to an "active" badge if no status is provided
    if (!status || status === 'active') {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
    }

    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>
      case 'shipped':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Shipped</Badge>
      case 'cancelled':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
      case 'pending':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Open</Badge>
      case 'awaiting_reply':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Awaiting Reply</Badge>
      case 'closed':
        return <Badge className="border border-muted">Closed</Badge>
      default:
        return <Badge className="border border-muted">{status}</Badge>
    }
  }
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const now = new Date()
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) {
        // Today - show time only
        return date.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit'
        })
      } else if (diffInDays === 1) {
        // Yesterday
        return 'Yesterday'
      } else if (diffInDays < 7) {
        // Within last week - show day name
        return date.toLocaleDateString(undefined, {
          weekday: 'short'
        })
      } else {
        // Older - show date
        return date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        })
      }
    } catch (e) {
      return '';
    }
  }

  const handleRetry = () => {
    loadConversations()
  }
  
  // Filter conversations based on selected filter and order
  const filteredConversations = conversations.filter(conv => {
    let statusMatch = selectedFilter === 'all' || conv.status.toLowerCase() === selectedFilter
    
    // Filter by order if selected
    let orderMatch = true
    if (selectedOrder) {
      orderMatch = conv.order_id === selectedOrder
    }
    
    return statusMatch && orderMatch
  })
  
  return (
    <Card className="w-full shadow-md border border-primary/10">
      <CardHeader className="border-b p-4 pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Messages</CardTitle>
          <CardDescription>View and manage your support conversations</CardDescription>
        </div>
        <Button onClick={() => setIsNewChatOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </CardHeader>
      
      {!isLoading && conversations.length > 0 && (
        <div className="p-4 pb-0 border-b flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="status-filter" className="text-sm font-medium">Status:</Label>
            <Select 
              value={selectedFilter} 
              onValueChange={(value) => setSelectedFilter(value as any)}
            >
              <SelectTrigger id="status-filter" className="h-8 w-[140px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="awaiting_reply">Awaiting Reply</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {orders.length > 0 && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="order-filter" className="text-sm font-medium">Order:</Label>
              <Select 
                value={selectedOrder?.toString() || 'none'} 
                onValueChange={(value) => setSelectedOrder(value === 'none' ? null : parseInt(value))}
              >
                <SelectTrigger id="order-filter" className="h-8 min-w-[180px]">
                  <SelectValue placeholder="All Orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Orders</SelectItem>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      #{order.orderNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-3 border-b last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full max-w-[250px]" />
                  <Skeleton className="h-3 w-full max-w-[400px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-destructive/5 p-4 rounded-lg flex flex-col items-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <h3 className="text-lg font-medium">Error Loading Conversations</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-3 max-w-md">{error}</p>
              <Button size="sm" onClick={handleRetry}>Try Again</Button>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessagesSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">
              {conversations.length === 0 
                ? "No conversations yet" 
                : "No conversations match your filters"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {conversations.length === 0 
                ? "Start a new conversation to get help from our support team." 
                : "Try changing your filters or create a new conversation."}
            </p>
            <div className="flex gap-2">
              {conversations.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedFilter('all')
                    setSelectedOrder(null)
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button onClick={() => setIsNewChatOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        ) :
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <Link key={conversation.id} href={`/account/chat/${conversation.id}`} className="block hover:bg-accent/50 transition-colors">
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarFallback className={cn(
                        conversation.status === 'awaiting_reply' 
                          ? 'bg-blue-100 text-blue-600' 
                          : conversation.status === 'open'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-600'
                      )}>
                        {conversation.status === 'awaiting_reply' ? 'CS' : 'YU'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">{conversation.title || 'Untitled Conversation'}</span>
                          {getStatusBadge(conversation.status)}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDate(conversation.updated_at)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                        {conversation.last_message_preview || 'No messages yet'}
                      </p>
                      
                      {/* Order or product info if available */}
                      {(conversation.order || conversation.product) && (
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          {conversation.order && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Order #{conversation.order.orderNumber}</span>
                            </div>
                          )}
                          
                          {conversation.order && conversation.product && (
                            <span className="mx-1">•</span>
                          )}
                          
                          {conversation.product && (
                            <div className="flex items-center">
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[120px]">{conversation.product.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Show unread indicator */}
                      {conversation.unread_count > 0 && (
                        <div className="mt-1">
                          <Badge className="bg-primary text-primary-foreground rounded-full text-xs px-2 py-0">
                            {conversation.unread_count} unread
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        }
      </CardContent>
      
      {/* New chat dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
            <DialogDescription>
              Start a new conversation with our support team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="How can we help you?"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
              />
            </div>
            
            {userOrders.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="order-select">
                  Link to an order (optional)
                  <span className="ml-1 text-xs text-muted-foreground font-normal">
                    - Only your orders can be linked
                  </span>
                </Label>
                <Select
                  value={selectedOrder?.toString() || 'none'}
                  onValueChange={(value) => setSelectedOrder(value === 'none' ? null : parseInt(value))}
                >
                  <SelectTrigger id="order-select">
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No order</SelectItem>
                    {userOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id.toString()}>
                        #{order.orderNumber} - {formatCurrency(order.totalAmount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isLoadingOrders && (
                  <div className="flex items-center justify-center py-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    <span className="text-sm">Loading orders...</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewChatOpen(false)}
              disabled={isCreatingChat}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateConversation}
              disabled={isCreatingChat || !newChatTitle.trim()}
            >
              {isCreatingChat ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 