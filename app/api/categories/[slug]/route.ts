import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  return NextResponse.json({ message: 'API route temporarily disabled' })
} 