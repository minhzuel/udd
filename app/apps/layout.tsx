'use client';

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container py-4 md:py-6">{children}</div>;
}
