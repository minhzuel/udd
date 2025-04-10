import Link from 'next/link'
import Image from 'next/image'
import { RiVisaLine, RiMastercardLine, RiPaypalLine, RiBankCardLine } from '@remixicon/react'

export function Footer() {
  return (
    <footer className="border-t hidden md:block">
      <div className="container">
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Payment Methods</h3>
            <div className="flex gap-3">
              <RiVisaLine className="h-8 w-8" />
              <RiMastercardLine className="h-8 w-8" />
              <RiPaypalLine className="h-8 w-8" />
              <RiBankCardLine className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Uddog. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/sitemap" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Sitemap
              </Link>
              <Link href="/accessibility" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 