import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miso",
  description: "Your AI companion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
