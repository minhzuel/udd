'use client'

import { Header } from './Header'
import { MobileFooter } from './MobileFooter'
import { Footer } from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main className="container py-6 pb-20 md:pb-6">{children}</main>
      <Footer />
      <MobileFooter />
    </div>
  )
} 