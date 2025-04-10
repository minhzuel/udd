'use client'

import { ThemeProvider } from './theme-provider'
import { CartProvider } from '@/app/contexts/CartContext'
import { CurrencyProvider } from '@/app/contexts/CurrencyContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CurrencyProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </CurrencyProvider>
    </ThemeProvider>
  )
} 