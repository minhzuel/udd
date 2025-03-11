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

interface NavItem {
  title: string;
  href?: string;
  external?: boolean;
  children?: NavItem[];
}

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
            {siteConfig.nav.map((item) => (
              <NavItemRenderer
                key={item.title}
                item={item}
                onOpenChange={setOpen}
                level={1}
              />
            ))}
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

interface NavItemRendererProps {
  item: NavItem;
  onOpenChange: (open: boolean) => void;
  level: number;
}

function NavItemRenderer({ item, onOpenChange, level }: NavItemRendererProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren && level <= 3) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="cursor-pointer flex w-full items-center justify-between text-sm font-medium hover:text-foreground transition-colors">
          <span>{item.title}</span>
          <ChevronDown
            className={cn(
              'ms-1 size-3.5 opacity-60 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className={cn('pt-2 flex flex-col space-y-2', `ps-5`)}>
            {item.children!.map((child) => (
              <NavItemRenderer
                key={child.title}
                item={child}
                onOpenChange={onOpenChange}
                level={level + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <MobileLink
      href={item.href || '#'}
      onOpenChange={onOpenChange}
      className="inline-flex items-center justify-between text-sm"
    >
      {item.title}
      {item.external && <ArrowUpRight className="ms-1 size-3.5 opacity-60" />}
    </MobileLink>
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
