'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import Script from 'next/script'

// Define global bKash interface
declare global {
  interface Window {
    bKash: {
      init: (config: {
        paymentMode: string
        paymentRequest: { amount: string }
        createRequest: (request: any) => void
        executeRequestOnAuthorization: () => void
        onClose: () => void
      }) => void
      create: () => {
        onSuccess: (data: any) => void
        onError: () => void
      }
      execute: () => {
        onSuccess: (data: any) => void
        onError: () => void
      }
    }
  }
}

export default function BkashPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get parameters from URL
  const paymentID = searchParams.get('paymentID')
  const amount = searchParams.get('amount')
  const orderId = searchParams.get('orderId')

  // State variables
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const handleScriptLoad = () => {
    console.log('bKash script loaded successfully')
    setScriptLoaded(true)
  }

  useEffect(() => {
    if (!scriptLoaded) return
    
    // Validate parameters
    if (!paymentID || !amount || !orderId) {
      setError('Missing required parameters')
      setLoading(false)
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) {
      setError('Invalid payment amount')
      setLoading(false)
      return
    }

    console.log('Initializing bKash payment with:', { paymentID, amount: numAmount, orderId })

    // Initialize bKash integration
    try {
      // Create hidden button for bKash
      const bKashButton = document.createElement('button')
      bKashButton.id = 'bKash_button'
      bKashButton.style.display = 'none'
      document.body.appendChild(bKashButton)

      // Initialize bKash payment
      window.bKash.init({
        paymentMode: 'checkout',
        paymentRequest: { amount: numAmount.toString() },
        createRequest: function(request) {
          // We already have a payment ID from the previous step
          console.log('bKash createRequest called with:', request)
          
          // We'll use the existing payment ID instead of creating a new one
          window.bKash.create().onSuccess({paymentID: paymentID})
        },
        executeRequestOnAuthorization: function() {
          console.log('bKash executeRequestOnAuthorization called - executing payment')
          
          // Execute the payment when user authorizes
          fetch('/api/payments/bkash/execute', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentID: paymentID
            }),
          })
          .then(response => response.json())
          .then(data => {
            console.log('bKash execute response:', data)
            if (data.status === 'success') {
              // Payment successful
              window.bKash.execute().onSuccess(data)
              toast.success('Payment completed successfully!')
              
              // Update order payment status with transaction ID
              fetch(`/api/orders/${orderId}/payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  paymentMethod: 'bkash',
                  transaction_id: data.transaction.trxID,
                  amount: numAmount
                }),
              })
              .then(response => {
                if (response.ok) {
                  console.log('Order payment status updated successfully')
                } else {
                  console.error('Failed to update order payment status')
                }
                // Redirect to order page regardless
                router.push(`/orders/${orderId}`)
              })
              .catch(err => {
                console.error('Error updating order payment status:', err)
                router.push(`/orders/${orderId}`)
              })
            } else {
              // Payment failed
              console.error('Payment failed:', data)
              setError(data.error || 'Payment processing failed')
              setLoading(false)
              window.bKash.execute().onError()
              toast.error(data.error || 'Payment processing failed')
            }
          })
          .catch(err => {
            console.error('Error processing payment:', err)
            setError('Payment processing failed')
            setLoading(false)
            window.bKash.execute().onError()
            toast.error('Payment processing failed')
          })
        },
        onClose: function() {
          console.log('bKash popup closed')
          router.push(`/checkout/confirmation?orderId=${orderId}`)
        }
      })

      // Click the bKash button to show the payment modal
      setTimeout(() => {
        const bkashButton = document.getElementById('bKash_button')
        if (bkashButton) {
          bkashButton.click()
        } else {
          setError('bKash button not found')
          setLoading(false)
        }
      }, 1000)
    } catch (err) {
      console.error('Error initializing bKash:', err)
      setError('Failed to initialize bKash payment')
      setLoading(false)
    }
  }, [scriptLoaded, paymentID, amount, orderId, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Load bKash script */}
      <Script
        src="https://scripts.sandbox.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout-sandbox.js"
        onLoad={handleScriptLoad}
        onError={() => {
          setError('Failed to load bKash script')
          setLoading(false)
        }}
      />

      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="https://www.bkash.com/sites/all/themes/bkash/logo.png"
            alt="bKash Logo"
            width={120}
            height={60}
            className="object-contain"
            unoptimized
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">bKash Payment</h2>

        {loading && !error && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mb-4"></div>
            <p className="text-gray-600">Processing your payment...</p>
            <p className="text-gray-500 text-sm mt-2">Please do not close this window.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => router.push(`/checkout/confirmation?orderId=${orderId}`)}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Checkout
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <p className="text-green-600 font-medium">Payment completed successfully!</p>
            <button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              View Order
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 