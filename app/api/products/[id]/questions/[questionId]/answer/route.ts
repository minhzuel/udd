import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  return NextResponse.json({ message: 'API route temporarily disabled' })
} 