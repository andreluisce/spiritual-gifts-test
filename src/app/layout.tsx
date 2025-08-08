import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spiritual Gifts Test",
  description: "Discover your spiritual gifts and calling through our comprehensive assessment",
};

// This layout just provides the root structure
// The actual locale layout is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}