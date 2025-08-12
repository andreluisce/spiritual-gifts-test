import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spiritual Gifts Test",
  description: "Discover your spiritual gifts and calling through our comprehensive assessment",
};

// This layout just passes through to the locale layout
// The actual HTML structure is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}