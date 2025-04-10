import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all currencies
    const currencies = await prisma.currencies.findMany({
      orderBy: {
        currency_id: 'asc'
      }
    })
    
    // Transform to camelCase for frontend
    const transformedCurrencies = currencies.map(currency => ({
      id: currency.currency_id,
      code: currency.code || 'USD',
      name: currency.name || 'US Dollar',
      symbol: currency.symbol || '$',
      exchangeRate: currency.exchange_rate ? parseFloat(currency.exchange_rate.toString()) : 1
    }))
    
    return NextResponse.json({ currencies: transformedCurrencies })
  } catch (error) {
    console.error('Error fetching currencies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    )
  }
} 