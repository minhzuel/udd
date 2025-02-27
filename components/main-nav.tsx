'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { NavItem, siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center justify-center mr-4">
      <nav className="flex items-center gap-4 xl:gap-6 text-sm font-medium">
        {siteConfig.nav.map((item: NavItem) => {
          // If the navigation item has children, render a dropdown menu.
          if (item.children && item.children.length > 0) {
            const isActive = item.children.some(
              (child) =>
                child.href === pathname ||
                (child.href !== '/' &&
                  child.href &&
                  pathname?.startsWith(child.href)),
            );
            return (
              <DropdownMenu key={item.title}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'inline-flex items-center gap-1 cursor-pointer transition-colors focus-visible:outline-0 hover:text-foreground',
                      isActive ? 'text-foreground' : 'text-foreground/60',
                    )}
                  >
                    {item.title}
                    <ChevronDown className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-[150px]"
                  side="bottom"
                  align="start"
                  sideOffset={15}
                  alignOffset={-10}
                >
                  {item.children.map((child) => {
                    const isChildActive =
                      child.href === pathname ||
                      (child.href !== '/' &&
                        child.href &&
                        pathname?.startsWith(child.href));
                    return (
                      <DropdownMenuItem key={child.title} asChild>
                        <Link
                          href={child.href || ''}
                          {...(child.external
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                          className={cn(
                            'block w-full transition-colors', // Base styles
                            isChildActive
                              ? 'text-foreground font-medium' // Active styles
                              : 'text-muted-foreground hover:text-foreground', // Inactive styles
                          )}
                        >
                          {child.title}
                          {child.external && (
                            <ArrowUpRight className="ml-1 size-3.5 opacity-60" />
                          )}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          // Render a simple link if no children exist.
          return (
            <Link
              key={item.title}
              href={item.href ?? '#'}
              {...(item.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="inline-flex items-center text-muted-foreground hover:text-foreground"
            >
              {item.title}
              {item.external && (
                <ArrowUpRight className="ms-1 size-3.5 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
