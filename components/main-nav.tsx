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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center justify-center mr-4">
      <nav className="flex items-center gap-4 xl:gap-6 text-sm font-medium">
        {siteConfig.nav.map((item: NavItem) => (
          <NavItemRenderer
            key={item.title}
            item={item}
            pathname={pathname}
            level={1}
          />
        ))}
      </nav>
    </div>
  );
}

interface NavItemRendererProps {
  item: NavItem;
  pathname: string | null;
  level: number;
}

function NavItemRenderer({ item, pathname, level }: NavItemRendererProps) {
  const hasChildren = item.children && item.children.length > 0;

  // Check if the current item or any of its descendants is active
  const isActive = hasChildren
    ? (item.children?.some(
        (child) =>
          child.href === pathname ||
          (child.href !== '/' &&
            child.href &&
            pathname?.startsWith(child.href)) ||
          (child.children?.some(
            (grandchild) =>
              grandchild.href === pathname ||
              (grandchild.href !== '/' &&
                grandchild.href &&
                pathname?.startsWith(grandchild.href)),
          ) ??
            false),
      ) ?? false)
    : item.href === pathname ||
      (item.href !== '/' && item.href && pathname?.startsWith(item.href));

  if (hasChildren && level <= 3) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'inline-flex items-center gap-1 cursor-pointer transition-colors focus-visible:outline-0 text-muted-foreground hover:text-foreground',
              isActive && 'text-foreground',
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
          {item.children?.map((child) => (
            <ChildNavItemRenderer
              key={child.title}
              item={child}
              pathname={pathname}
              level={level + 1}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link
      href={item.href ?? '#'}
      {...(item.external
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      className={cn(
        'inline-flex items-center transition-colors text-muted-foreground hover:text-foreground',
        isActive && 'text-foreground',
      )}
    >
      {item.title}
      {item.external && <ArrowUpRight className="ms-1 size-3.5 opacity-60" />}
    </Link>
  );
}

interface ChildNavItemRendererProps {
  item: NavItem;
  pathname: string | null;
  level: number;
}

function ChildNavItemRenderer({
  item,
  pathname,
  level,
}: ChildNavItemRendererProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive =
    item.href === pathname ||
    (item.href !== '/' && item.href && pathname?.startsWith(item.href)) ||
    (hasChildren &&
      (item.children?.some(
        (grandchild) =>
          grandchild.href === pathname ||
          (grandchild.href !== '/' &&
            grandchild.href &&
            pathname?.startsWith(grandchild.href)),
      ) ??
        false));

  if (hasChildren && level <= 3) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          className={cn(
            'flex items-center justify-between w-full text-muted-foreground hover:text-foreground',
            isChildActive && 'text-foreground font-medium',
          )}
        >
          {item.title}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-[150px]">
          {item.children?.map((child) => (
            <ChildNavItemRenderer
              key={child.title}
              item={child}
              pathname={pathname}
              level={level + 1}
            />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem asChild>
      <Link
        href={item.href || ''}
        {...(item.external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
        className={cn(
          'block w-full transition-colors',
          isChildActive
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {item.title}
        {item.external && <ArrowUpRight className="ml-1 size-3.5 opacity-60" />}
      </Link>
    </DropdownMenuItem>
  );
}
