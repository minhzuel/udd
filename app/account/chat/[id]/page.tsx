'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Send, MessagesSquare, Check, Clock, ShoppingBag, ExternalLink, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  fetchMessages, 
  sendMessage, 
  fetchUserOrders,
  type Message,
  type Product,
  type Order, 
  type ConversationData 
} from '@/app/services'

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const conversationId = params.id
  const [conversationTitle, setConversationTitle] = useState('')
  const [conversationOrder, setConversationOrder] = useState<Order | null>(null)
  const [conversationProduct, setConversationProduct] = useState<Product | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [selectedOrderToLink, setSelectedOrderToLink] = useState<number | null>(null)
  const [isOrdersPopoverOpen, setIsOrdersPopoverOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchConversationMessages()
  }, [])

  useEffect(() => {
    // Fetch user orders when orders popover is opened
    if (isOrdersPopoverOpen) {
      fetchAvailableUserOrders()
    }
  }, [isOrdersPopoverOpen])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  const fetchConversationMessages = async (page = 1, append = false) => {
    try {
      setIsLoading(true)
      
      if (!append) {
        setError(null)
      }
      
      // Default limit to 50, but use 100 for first load for better UX
      const limit = page === 1 ? 100 : 50
      
      const data = await fetchMessages(conversationId, page, limit)
      
      if (!data) {
        throw new Error('Failed to load messages')
      }
      
      if (append) {
        // When loading more, append to existing messages
        setMessages(prev => [...prev, ...data.messages])
      } else {
        // For initial load, replace messages
        setMessages(data.messages)
        setConversationTitle(data.title || 'Chat Support')
        
        // Update order information if it's available
        if (data.order) {
          setConversationOrder(data.order)
        } else {
          setConversationOrder(null)
        }
        
        setConversationProduct(data.product || null)
      }
      
      // Store pagination info if needed for "load more" functionality
      setPagination(data.pagination)
      
      // Only set hasMore if we're appending and need to track if there are more pages
      if (append) {
        setHasMore(data.pagination.page < data.pagination.pages)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages'
      console.error('Error fetching messages:', error)
      
      if (!append) {
        // Only show error for initial load, not when loading more
        setError(errorMessage)
      } else {
        // For "load more" failures, show a toast
        toast.error(`Failed to load more messages: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
      setLoadingMore(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    fetchConversationMessages()
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return ''
      }
      return date.toLocaleTimeString(undefined, { 
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return ''
    }
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
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return 'Invalid date'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedOrderToLink) || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Create optimistic message for better UX
      const optimisticId = Date.now()
      let content = messageText.trim()
      
      // If there's a linked order but no message, create a default message
      if (!content && selectedOrderToLink) {
        content = `I'm inquiring about order #${userOrders.find(o => o.id === selectedOrderToLink)?.orderNumber || selectedOrderToLink}`
      }
      
      const optimisticMessage: Message = {
        id: optimisticId,
        content: content,
        isFromCustomer: true,
        timestamp: new Date().toISOString(),
        readStatus: 'sent'
      }
      
      // Add optimistic message to UI
      setMessages(prev => [...prev, optimisticMessage])
      
      // Clear input immediately
      const messageCopy = content
      setMessageText('')
      
      // Get selected order
      const orderIdToLink = selectedOrderToLink
      setSelectedOrderToLink(null)
      
      // Call the service function to send the message
      const serverMessage = await sendMessage(
        conversationId, 
        messageCopy, 
        orderIdToLink
      )
      
      if (serverMessage) {
        // Replace optimistic message with real one from server
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticId ? serverMessage : msg
          )
        )
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      console.error('Error sending message:', error)
      toast.error(errorMessage)
      
      // Remove failed optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()))
      
      // Restore message text to allow retrying
      setMessageText(messageText)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchAvailableUserOrders = async () => {
    try {
      setIsLoadingOrders(true)
      
      const orders = await fetchUserOrders()
      setUserOrders(orders)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load orders'
      console.error('Error fetching user orders:', error)
      toast.warning(`${errorMessage}. You can still send messages without linking an order.`)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const handleAttachOrder = (orderId: number) => {
    if (!messageText.trim()) {
      // If message is empty, set a default message
      setMessageText(`I'm inquiring about order #${userOrders.find(o => o.id === orderId)?.orderNumber || orderId}`)
    }
    
    setSelectedOrderToLink(orderId)
    setIsOrdersPopoverOpen(false)
  }

  const handleImageUpload = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported')
      return
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }
    
    toast.info('Image upload will be implemented soon')
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  return (
    <Card className="flex flex-col h-[700px] border border-primary/10 shadow-md overflow-hidden">
      <CardHeader className="border-b p-3 flex-shrink-0 space-y-0">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            size="sm"
            className="p-0 mr-2 h-8 w-8"
            onClick={() => router.push('/account/chat')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <CardTitle className="text-base truncate">{conversationTitle}</CardTitle>
            
            {(conversationOrder || conversationProduct) && (
              <div className="flex items-center gap-2 mt-1">
                {conversationOrder && (
                  <div className="flex items-center text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="text-xs">Order #{conversationOrder.orderNumber}</span>
                      {conversationOrder.status && (
                        <div className="ml-2">
                          {getOrderStatusBadge(conversationOrder.status)}
                        </div>
                      )}
                      <Button size="sm" className="h-6 py-0 px-1 ml-1" onClick={() => router.push(`/account/orders/${conversationOrder.id}`)}>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {conversationProduct && conversationOrder && (
                  <Separator orientation="vertical" className="h-3" />
                )}
                
                {conversationProduct && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ShoppingBag className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate max-w-[150px]">{conversationProduct.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      {error ? (
        <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-destructive/5 p-4 rounded-lg flex flex-col items-center text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-3" />
            <h2 className="text-lg font-medium mb-1">Error Loading Messages</h2>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button size="sm" onClick={handleRetry}>Try Again</Button>
          </div>
        </CardContent>
      ) : isLoading && messages.length === 0 ? (
        <CardContent className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-muted' : 'bg-primary/10'} p-2 rounded-lg shadow-sm`}>
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-2" ref={messageContainerRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-6 max-w-xs w-full bg-muted/50 rounded-lg">
                <div className="flex flex-col items-center">
                  <MessagesSquare className="h-10 w-10 text-muted-foreground mb-2" />
                  <h2 className="text-base font-medium mb-1">No Messages Yet</h2>
                  <p className="text-xs text-muted-foreground">Send a message to start the conversation</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Load More button at top when there are more messages to load */}
              {hasMore && (
                <div className="flex justify-center my-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      if (!loadingMore) {
                        setLoadingMore(true)
                        fetchConversationMessages(pagination.page + 1, true)
                      }
                    }}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
              
              {messages.map((message, index) => {
                // Add timestamp divider if needed
                const currentDate = new Date(message.timestamp).toDateString();
                const prevDate = index > 0 ? new Date(messages[index - 1].timestamp).toDateString() : null;
                const showDateDivider = index === 0 || currentDate !== prevDate;
                
                return (
                  <div key={message.id}>
                    {showDateDivider && (
                      <div className="flex justify-center my-2">
                        <div className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleDateString(undefined, { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex ${message.isFromCustomer ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={cn(
                        'max-w-[85%] p-2 px-3 rounded-2xl text-sm',
                        message.isFromCustomer 
                          ? 'bg-primary text-primary-foreground rounded-br-none shadow-sm'
                          : 'bg-muted/80 rounded-bl-none border border-muted-foreground/10'
                      )}>
                        {message.content && (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                        
                        {message.attachmentUrl && (
                          <div className="mt-1">
                            {message.attachmentType === 'image' ? (
                              <img 
                                src={message.attachmentUrl} 
                                alt="Attachment" 
                                className="max-w-full rounded-lg"
                              />
                            ) : (
                              <a 
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline flex items-center text-xs"
                              >
                                View Attachment
                              </a>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-end items-center mt-1">
                          <span className="text-[10px] opacity-70 mr-1">{formatTime(message.timestamp)}</span>
                          {message.isFromCustomer && message.readStatus && (
                            <span className="text-xs opacity-70">
                              {message.readStatus === 'read' ? (
                                <Check className="h-3 w-3" />
                              ) : message.readStatus === 'delivered' ? (
                                <Check className="h-3 w-3" />
                              ) : null}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Input area with order selector and image upload */}
      <CardFooter className="p-3 border-t flex items-end gap-2">
        <Popover open={isOrdersPopoverOpen} onOpenChange={setIsOrdersPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 w-9 rounded-full flex-shrink-0"
              title="Attach Order"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-[240px]" align="start">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Link to Order</h4>
              {isLoadingOrders ? (
                <div className="flex items-center justify-center py-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  <span className="text-sm">Loading orders...</span>
                </div>
              ) : userOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No orders found</p>
              ) : (
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {userOrders.map(order => (
                    <button
                      key={order.id}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center hover:bg-accent transition-colors",
                        selectedOrderToLink === order.id && "bg-accent"
                      )}
                      onClick={() => handleAttachOrder(order.id)}
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium">#{order.orderNumber}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                        {order.totalAmount && (
                          <span className="text-xs font-medium mt-1">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        )}
                      </div>
                      {getOrderStatusBadge(order.status || '')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex-1 relative">
          {selectedOrderToLink && (
            <div className="absolute -top-8 left-0 right-0 bg-muted/40 rounded p-1 flex items-center text-xs">
              <ShoppingBag className="h-3 w-3 mr-1" />
              <span className="font-medium">
                Order #{userOrders.find(o => o.id === selectedOrderToLink)?.orderNumber || ''}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 ml-auto" 
                onClick={() => setSelectedOrderToLink(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </Button>
            </div>
          )}
          <Textarea
            placeholder="Type your message..."
            className="resize-none min-h-[60px]"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-full flex-shrink-0"
          onClick={handleImageUpload}
          disabled={isSubmitting}
          title="Upload Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          className="h-9 w-9 rounded-full flex-shrink-0"
          onClick={handleSendMessage}
          disabled={isSubmitting || (!messageText.trim() && !selectedOrderToLink)}
        >
          {isSubmitting ? (
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </CardFooter>
    </Card>
  )
}