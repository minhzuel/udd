import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId(request)
    
    if (!userId) {
      return NextResponse.json({ authenticated: false })
    }
    
    return NextResponse.json({
      authenticated: true,
      userId
    })
  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    )
  }
} 