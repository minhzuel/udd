'use client';

import { useMediaQuery } from '@/hooks/use-media-query';

export type ResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
export type ResponsiveQuery = 'up' | 'down' | 'between';

// Generate CSS custom properties for each responsive breakpoint defined in Tailwind.
// These variables are injected into :root, making them accessible at runtime.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const breakpoints = [
  'w-[var(--breakpoint-sm)]',
  'w-[var(--breakpoint-md)]',
  'w-[var(--breakpoint-lg)]',
  'w-[var(--breakpoint-xl)]',
  'w-[var(--breakpoint-2xl)]',
];

const useResponsive = (
  query: ResponsiveQuery,
  key?: ResponsiveBreakpoint,
  start?: ResponsiveBreakpoint,
  end?: ResponsiveBreakpoint,
) => {
  // Always compute a query string before calling useMediaQuery.
  const computed = getComputedStyle(document.documentElement);
  const queryString = (() => {
    if (query === 'up' && key) {
      const breakpoint = computed
        .getPropertyValue(`--breakpoint-${key}`)
        .trim();
      return breakpoint ? `(min-width: ${breakpoint})` : '';
    }
    if (query === 'down' && key) {
      const breakpoint = computed
        .getPropertyValue(`--breakpoint-${key}`)
        .trim();
      return breakpoint ? `(max-width: ${breakpoint})` : '';
    }
    if (query === 'between' && start && end) {
      const startBreakpoint = computed
        .getPropertyValue(`--breakpoint-${start}`)
        .trim();
      const endBreakpoint = computed
        .getPropertyValue(`--breakpoint-${end}`)
        .trim();
      return startBreakpoint && endBreakpoint
        ? `(min-width: ${startBreakpoint}) and (max-width: ${endBreakpoint})`
        : '';
    }
    return '';
  })();

  // Call useMediaQuery unconditionally.
  const matches = useMediaQuery(queryString);

  return matches;
};

export { useResponsive };
