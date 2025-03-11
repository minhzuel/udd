import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col items-center justify-between gap-1 md:gap-2.5 py-3 md:py-4 md:flex-row">
        <div className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy;
          {new Date().getFullYear()} ReUI. All rights reserved.
        </div>

        <div className="inline-flex gap-1 items-center text-sm">
          <span className="text-muted-foreground">A project by</span>{' '}
          <Link
            className="font-medium text-foreground hover:underline hover:underline-offset-2"
            href="https://keenthemes.com"
            target="_blank"
          >
            Keenthemes
          </Link>
        </div>
      </div>
    </footer>
  );
}
