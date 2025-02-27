'use client';

import * as React from 'react';
import Image from 'next/image';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ChevronDown, Menu } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  const onOpenChange = React.useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  return (
    <div className="flex md:hidden items-center gap-2.5">
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="size-8 p-0 -ml-2">
            <Menu className="size-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[60svh] p-5">
          <div className="flex flex-col space-y-3">
            {siteConfig.nav.map((item) => {
              // If the nav item has children, render it as a collapsible section.
              if (item.children && item.children.length > 0) {
                return (
                  <Collapsible key={item.title}>
                    <CollapsibleTrigger className="cursor-pointer flex w-full items-center justify-between text-sm font-medium hover:text-foreground transition-colors">
                      <span>{item.title}</span>
                      <ChevronDown className="ms-1 size-3.5 opacity-60" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pt-2 ms-4 flex flex-col space-y-2">
                        {item.children.map((child) => (
                          <MobileLink
                            key={child.href}
                            href={child.href}
                            onOpenChange={setOpen}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            {child.title}
                          </MobileLink>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              // Otherwise, render a simple mobile link.
              return (
                <MobileLink
                  key={item.href}
                  href={item.href || '#'}
                  onOpenChange={setOpen}
                  className="inline-flex items-center justify-between text-sm"
                >
                  {item.title}
                  {item.external && (
                    <ArrowUpRight className="ms-1 size-3.5 opacity-60" />
                  )}
                </MobileLink>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

      <Link href="/" className="flex items-center">
        <Image
          src="/brand/logo-icon-light.svg"
          alt={siteConfig.name}
          width={30}
          height={30}
          className="dark:hidden"
        />
        <Image
          src="/brand/logo-icon-dark.svg"
          alt={siteConfig.name}
          width={30}
          height={30}
          className="hidden dark:inline-block"
        />
      </Link>
    </div>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn('text-base', className)}
      {...props}
    >
      {children}
    </Link>
  );
}
