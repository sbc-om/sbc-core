import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "SBC ERP",
  description: "Modern ERP for daily business operations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
