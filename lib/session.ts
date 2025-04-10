import { NextRequest } from 'next/server';

/**
 * Extracts the user ID from the session cookie
 * @param request The Next.js request object
 * @returns The user ID if found, or null if not authenticated
 */
export async function getSessionUserId(request: Request | NextRequest): Promise<number | null> {
  try {
    // Handle both NextRequest and regular Request types
    let sessionCookieValue: string | undefined;
    
    if ('cookies' in request && typeof request.cookies.get === 'function') {
      // NextRequest
      const sessionCookie = request.cookies.get('session');
      sessionCookieValue = sessionCookie?.value;
    } else {
      // Regular Request
      const cookieHeader = request.headers.get('cookie') || '';
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      sessionCookieValue = cookies['session'];
    }
    
    if (!sessionCookieValue) {
      return null;
    }
    
    const userId = parseInt(sessionCookieValue);
    return isNaN(userId) ? null : userId;
  } catch (error) {
    console.error('Error getting session user ID:', error);
    return null;
  }
} 