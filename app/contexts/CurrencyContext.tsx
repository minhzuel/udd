'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Currency = {
  id: number
  code: string
  name: string
  symbol: string
  exchangeRate: number
}

interface CurrencyContextType {
  currency: Currency
  currencies: Currency[]
  setCurrency: (currency: Currency) => void
  formatPrice: (amount: number) => string
  loading: boolean
}

const defaultCurrency: Currency = {
  id: 1,
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  exchangeRate: 1
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/api/currencies')
        if (response.ok) {
          const data = await response.json()
          setCurrencies(data.currencies)
          
          // If we have currencies and no active currency set yet, use the first one
          if (data.currencies.length > 0 && !localStorage.getItem('currency')) {
            setCurrency(data.currencies[0])
          }
        }
      } catch (error) {
        console.error('Error fetching currencies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrencies()
  }, [])

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency')
    if (savedCurrency) {
      try {
        setCurrency(JSON.parse(savedCurrency))
      } catch (error) {
        console.error('Error loading currency from localStorage:', error)
      }
    }
    setIsHydrated(true)
  }, [])

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('currency', JSON.stringify(currency))
    }
  }, [currency, isHydrated])

  // Format price according to current currency
  const formatPrice = (amount: number): string => {
    // Convert amount from base currency (USD) to selected currency
    const convertedAmount = amount * currency.exchangeRate

    // Format with the currency symbol
    if (currency.code === 'BDT') {
      return `${currency.symbol}${convertedAmount.toFixed(2)}`
    }
    
    // For USD and most other currencies, symbol comes first
    return `${currency.symbol}${convertedAmount.toFixed(2)}`
  }

  // Don't render children until hydration is complete
  if (!isHydrated) {
    return null
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencies,
        setCurrency,
        formatPrice,
        loading
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
} 