import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileFooter } from '@/components/layout/MobileFooter'
import { Providers } from './providers/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Uddog - Change the wind',
  description: 'Your one-stop destination for all your shopping needs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileFooter />
        </Providers>
      </body>
    </html>
  )
}
