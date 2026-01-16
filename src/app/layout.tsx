import type { Metadata } from "next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Spiritual Gifts Test",
  description: "Discover your spiritual gifts and calling through our comprehensive assessment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}