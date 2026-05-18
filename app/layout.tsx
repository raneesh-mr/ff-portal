import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Already Wealthy",
  description: "Track your investments, goals, and manifest your wealth.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ background: '#0A0E27', color: '#F8FAFC' }}>
        {children}
      </body>
    </html>
  );
}
