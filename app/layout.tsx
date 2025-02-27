import { ReactNode, Suspense } from 'react';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { DirectionProvider } from '@/providers/direction-provider';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import '@/styles/globals.css';

export const metadata = {
  title: 'CrudHunt',
  description:
    'Plug-and-play CRUDs and UI components built with React, Next.js, and Radix UI, styled elegantly with Tailwind',
};

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body
        className={cn('flex h-full text-base antialiased', inter.className)}
        style={{ overflow: 'visible !important', marginRight: '0 !important' }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <QueryProvider>
            <DirectionProvider>
              <Suspense>
                <div
                  vaul-drawer-wrapper="true"
                  className="w-full relative min-h-screen bg-background"
                >
                  <div className="flex flex-col h-full">
                    <SiteHeader />
                    <main className="grow flex-1">{children}</main>
                    <SiteFooter />
                  </div>
                </div>
              </Suspense>
            </DirectionProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
