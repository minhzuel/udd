import { toast } from 'sonner';

export type Message = {
  id: number;
  content: string;
  isFromCustomer: boolean;
  timestamp: string;
  readStatus?: 'sent' | 'delivered' | 'read';
  attachmentUrl?: string;
  attachmentType?: string;
};

export interface Product {
  id: number;
  name: string;
  slug: string;
  mainImage: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status?: string;
}

export interface ConversationData {
  messages: Message[];
  pagination: { total: number; page: number; pages: number };
  title?: string;
  order?: Order | null;
  product?: Product | null;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  status: string;
  last_message_preview: string;
  unread_count: number;
  product_id: number | null;
  order_id: number | null;
  product?: Product | null;
  order?: Order | null;
}

// Map response data to ensure it matches our expected interface format
const mapConversation = (response: any): Conversation => {
  return {
    id: response.id,
    title: response.title,
    created_at: response.created_at,
    updated_at: response.updated_at,
    status: response.status,
    last_message_preview: response.last_message_preview,
    unread_count: response.unread_count,
    product_id: response.product_id,
    order_id: response.order_id,
    product: response.products ? {
      id: response.products.product_id,
      name: response.products.name,
      slug: response.products.slug,
      mainImage: response.products.main_image
    } : null,
    order: response.orders ? {
      id: response.orders.order_id,
      orderNumber: response.orders.guest_id?.toString() || response.orders.order_id.toString(),
      orderDate: response.orders.order_date,
      totalAmount: response.orders.total_amount,
      status: response.orders.order_status
    } : null
  };
}

// Map message response data to our interface
const mapMessage = (response: any): Message => {
  return {
    id: response.id,
    content: response.content,
    isFromCustomer: response.is_from_customer,
    timestamp: response.timestamp,
    readStatus: response.readStatus,
    attachmentUrl: response.attachment_url,
    attachmentType: response.attachment_type
  };
}

/**
 * Fetch all chat conversations for the current user
 */
export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const response = await fetch('/api/account/chat', {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || 'Failed to load conversations';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.map(mapConversation);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
    console.error('Error fetching conversations:', error);
    toast.error(errorMessage);
    return [];
  }
}

/**
 * Create a new chat conversation
 */
export async function createConversation(title: string, productId?: number, orderId?: number): Promise<Conversation | null> {
  try {
    // If an orderId is provided, only send that and the title
    // This ensures we only link to orders belonging to the logged-in user
    const payload = orderId 
      ? { title, orderId } 
      : { title, productId };
      
    const response = await fetch('/api/account/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || 'Failed to create conversation';
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
    console.error('Error creating conversation:', error);
    toast.error(errorMessage);
    return null;
  }
}

/**
 * Fetch messages for a specific conversation
 */
export async function fetchMessages(
  conversationId: string, 
  page = 1, 
  limit = 100
): Promise<ConversationData | null> {
  try {
    const response = await fetch(
      `/api/account/chat/${conversationId}/messages?page=${page}&limit=${limit}`, 
      {
        method: 'GET',
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || 'Failed to load messages';
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Use the mapper function for consistent mapping
    return mapConversationDetails(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
    console.error('Error fetching messages:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Send a new message in a conversation
 */
export async function sendMessage(
  conversationId: string, 
  content: string, 
  orderId?: number | null,
  messageType: 'text' | 'image' = 'text',
  attachment?: File
): Promise<Message | null> {
  try {
    // For handling file uploads later
    let formData: FormData | null = null;
    
    if (attachment && messageType === 'image') {
      formData = new FormData();
      formData.append('content', content);
      formData.append('messageType', messageType);
      formData.append('attachment', attachment);
      if (orderId) formData.append('orderId', orderId.toString());
    }
    
    const response = await fetch(`/api/account/chat/${conversationId}/messages`, {
      method: 'POST',
      ...(formData 
        ? {} // No headers for FormData, browser sets them automatically
        : {
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content,
              messageType,
              orderId,
            }),
          }
      ),
      body: formData || JSON.stringify({
        content,
        messageType,
        orderId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || 'Failed to send message';
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    console.error('Error sending message:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Fetch user orders for chat linking
 */
export async function fetchUserOrders(): Promise<Order[]> {
  try {
    const response = await fetch('/api/user/orders?limit=10&for=chat');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || 'Failed to load orders';
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format for orders');
    }
    
    return data.map(order => ({
      ...order,
      status: order.status || 'active'
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load orders';
    console.error('Error fetching user orders:', error);
    throw new Error(errorMessage);
  }
}

// Map conversation details for the single conversation view
const mapConversationDetails = (data: any): ConversationData => {
  return {
    messages: data.messages.map(mapMessage),
    pagination: data.pagination,
    title: data.title,
    // Map nested objects if they exist
    order: data.order ? {
      id: data.order.order_id,
      orderNumber: data.order.guest_id?.toString() || data.order.order_id.toString(),
      orderDate: data.order.order_date,
      totalAmount: data.order.total_amount,
      status: data.order.order_status
    } : null,
    product: data.product ? {
      id: data.product.product_id,
      name: data.product.name,
      slug: data.product.slug,
      mainImage: data.product.main_image
    } : null
  };
} 