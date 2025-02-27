'use client';

export default function CrudsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container py-4 md:py-6">{children}</div>;
}
